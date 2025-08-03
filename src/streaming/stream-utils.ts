/**
 * Streaming Utilities for SvelTUI
 * 
 * Helper functions for working with various stream types
 * and implementing flow control strategies.
 */

/**
 * Convert a Response object to a ReadableStream
 */
export async function responseToStream(response: Response): ReadableStream<Uint8Array> {
  if (!response.body) {
    throw new Error('Response has no body');
  }
  return response.body;
}

/**
 * Convert text to a simulated stream with configurable speed
 */
export function textToStream(text: string, options: {
  chunkSize?: number;
  delay?: number;
} = {}): ReadableStream<string> {
  const { chunkSize = 10, delay = 50 } = options;
  
  return new ReadableStream<string>({
    async start(controller) {
      let position = 0;
      
      while (position < text.length) {
        const chunk = text.slice(position, position + chunkSize);
        controller.enqueue(chunk);
        position += chunkSize;
        
        if (delay > 0 && position < text.length) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      controller.close();
    }
  });
}

/**
 * Create a stream that simulates Claude API responses
 */
export function createMockClaudeStream(content: string, options: {
  model?: string;
  streamDelay?: number;
  chunkVariance?: boolean;
} = {}): ReadableStream<string> {
  const { 
    model = 'claude-3-opus-20240229',
    streamDelay = 30,
    chunkVariance = true 
  } = options;
  
  // Simulate SSE format
  return new ReadableStream<string>({
    async start(controller) {
      // Start event
      controller.enqueue(`data: {"type":"message_start","message":{"model":"${model}"}}\n\n`);
      await new Promise(resolve => setTimeout(resolve, streamDelay));
      
      // Content start
      controller.enqueue(`data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}\n\n`);
      await new Promise(resolve => setTimeout(resolve, streamDelay));
      
      // Stream content in chunks
      const words = content.split(' ');
      let accumulated = '';
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        accumulated += (i > 0 ? ' ' : '') + word;
        
        // Vary chunk size for realism
        const chunkWords = chunkVariance ? Math.floor(Math.random() * 3) + 1 : 1;
        let chunk = word;
        
        for (let j = 1; j < chunkWords && i + j < words.length; j++) {
          chunk += ' ' + words[i + j];
          accumulated += ' ' + words[i + j];
          i++;
        }
        
        controller.enqueue(`data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"${chunk.replace(/"/g, '\\"')}"}}\n\n`);
        
        // Variable delay for more realistic streaming
        const delay = chunkVariance 
          ? streamDelay + Math.random() * streamDelay 
          : streamDelay;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // End events
      controller.enqueue(`data: {"type":"content_block_stop","index":0}\n\n`);
      await new Promise(resolve => setTimeout(resolve, streamDelay));
      controller.enqueue(`data: {"type":"message_delta","delta":{"stop_reason":"end_turn"}}\n\n`);
      controller.enqueue(`data: {"type":"message_stop"}\n\n`);
      
      controller.close();
    }
  });
}

/**
 * Parse SSE (Server-Sent Events) stream
 */
export async function* parseSSEStream(stream: ReadableStream<Uint8Array>): AsyncGenerator<any> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            yield parsed;
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Apply backpressure to a stream based on buffer size
 */
export function createBackpressureStream<T>(
  source: ReadableStream<T>,
  options: {
    highWaterMark?: number;
    lowWaterMark?: number;
    onPressure?: (high: boolean) => void;
  } = {}
): ReadableStream<T> {
  const { 
    highWaterMark = 100,
    lowWaterMark = 50,
    onPressure = () => {}
  } = options;
  
  let buffer: T[] = [];
  let paused = false;
  let sourceReader: ReadableStreamDefaultReader<T> | null = null;
  
  return new ReadableStream<T>({
    async start(controller) {
      sourceReader = source.getReader();
      
      // Start reading from source
      (async () => {
        try {
          while (true) {
            // Check backpressure
            if (buffer.length >= highWaterMark && !paused) {
              paused = true;
              onPressure(true);
            } else if (buffer.length <= lowWaterMark && paused) {
              paused = false;
              onPressure(false);
            }
            
            // Wait if paused
            if (paused) {
              await new Promise(resolve => setTimeout(resolve, 100));
              continue;
            }
            
            const { done, value } = await sourceReader!.read();
            
            if (done) {
              // Flush remaining buffer
              while (buffer.length > 0) {
                controller.enqueue(buffer.shift()!);
              }
              controller.close();
              break;
            }
            
            if (value !== undefined) {
              buffer.push(value);
            }
          }
        } catch (error) {
          controller.error(error);
        }
      })();
    },
    
    pull(controller) {
      // Dequeue from buffer when downstream is ready
      if (buffer.length > 0) {
        controller.enqueue(buffer.shift()!);
      }
    },
    
    cancel() {
      if (sourceReader) {
        sourceReader.cancel();
      }
    }
  });
}

/**
 * Merge multiple streams into one
 */
export function mergeStreams<T>(...streams: ReadableStream<T>[]): ReadableStream<T> {
  return new ReadableStream<T>({
    async start(controller) {
      const readers = streams.map(s => s.getReader());
      const reading = new Set(readers);
      
      // Read from all streams concurrently
      await Promise.all(
        readers.map(async (reader) => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                reading.delete(reader);
                if (reading.size === 0) {
                  controller.close();
                }
                break;
              }
              
              if (value !== undefined) {
                controller.enqueue(value);
              }
            }
          } catch (error) {
            controller.error(error);
          } finally {
            reader.releaseLock();
          }
        })
      );
    }
  });
}

/**
 * Transform stream chunks
 */
export function transformStream<T, U>(
  stream: ReadableStream<T>,
  transform: (chunk: T) => U | Promise<U>
): ReadableStream<U> {
  return stream.pipeThrough(
    new TransformStream<T, U>({
      async transform(chunk, controller) {
        try {
          const transformed = await transform(chunk);
          controller.enqueue(transformed);
        } catch (error) {
          controller.error(error);
        }
      }
    })
  );
}

/**
 * Throttle stream to limit throughput
 */
export function throttleStream<T>(
  stream: ReadableStream<T>,
  bytesPerSecond: number,
  getSize: (chunk: T) => number = () => 1
): ReadableStream<T> {
  let lastTime = Date.now();
  let tokens = bytesPerSecond;
  
  return stream.pipeThrough(
    new TransformStream<T, T>({
      async transform(chunk, controller) {
        const now = Date.now();
        const elapsed = now - lastTime;
        lastTime = now;
        
        // Replenish tokens
        tokens = Math.min(bytesPerSecond, tokens + (elapsed / 1000) * bytesPerSecond);
        
        const size = getSize(chunk);
        
        // Wait if not enough tokens
        while (tokens < size) {
          await new Promise(resolve => setTimeout(resolve, 10));
          const now = Date.now();
          const elapsed = now - lastTime;
          lastTime = now;
          tokens = Math.min(bytesPerSecond, tokens + (elapsed / 1000) * bytesPerSecond);
        }
        
        tokens -= size;
        controller.enqueue(chunk);
      }
    })
  );
}

/**
 * Buffer stream chunks for batch processing
 */
export function bufferStream<T>(
  stream: ReadableStream<T>,
  size: number,
  timeout?: number
): ReadableStream<T[]> {
  let buffer: T[] = [];
  let timer: any;
  
  return stream.pipeThrough(
    new TransformStream<T, T[]>({
      transform(chunk, controller) {
        buffer.push(chunk);
        
        if (buffer.length >= size) {
          controller.enqueue([...buffer]);
          buffer = [];
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
        } else if (timeout && !timer) {
          timer = setTimeout(() => {
            if (buffer.length > 0) {
              controller.enqueue([...buffer]);
              buffer = [];
            }
            timer = null;
          }, timeout);
        }
      },
      
      flush(controller) {
        if (buffer.length > 0) {
          controller.enqueue(buffer);
        }
        if (timer) {
          clearTimeout(timer);
        }
      }
    })
  );
}