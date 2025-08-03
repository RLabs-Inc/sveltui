/**
 * Reactive Streaming System for SvelTUI
 * 
 * Provides efficient content streaming with backpressure support
 * using Svelte 5's reactivity system.
 */

export interface StreamOptions {
  /** Maximum number of chunks to buffer before applying backpressure */
  bufferSize?: number;
  /** Chunk size in characters for text streams */
  chunkSize?: number;
  /** Enable automatic flow control */
  autoBackpressure?: boolean;
  /** Callback when stream completes */
  onComplete?: () => void;
  /** Callback for stream errors */
  onError?: (error: Error) => void;
}

export interface StreamMetrics {
  chunksReceived: number;
  bytesReceived: number;
  isPaused: boolean;
  bufferUsage: number;
  startTime: number;
  endTime?: number;
}

/**
 * Creates a reactive stream handler for content streaming
 */
export class ReactiveStream {
  // State
  private chunks = $state<string[]>([]);
  private isStreaming = $state(false);
  private isPaused = $state(false);
  private error = $state<Error | null>(null);
  private metrics = $state<StreamMetrics>({
    chunksReceived: 0,
    bytesReceived: 0,
    isPaused: false,
    bufferUsage: 0,
    startTime: Date.now()
  });

  // Options
  private options: Required<StreamOptions>;
  
  // Stream control
  private controller: ReadableStreamDefaultController<string> | null = null;
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private decoder = new TextDecoder();
  
  constructor(options: StreamOptions = {}) {
    this.options = {
      bufferSize: options.bufferSize ?? 100,
      chunkSize: options.chunkSize ?? 1024,
      autoBackpressure: options.autoBackpressure ?? true,
      onComplete: options.onComplete ?? (() => {}),
      onError: options.onError ?? (() => {})
    };
  }

  // Derived values
  get content() {
    return $derived(this.chunks.join(''));
  }

  get lastChunk() {
    return $derived(this.chunks[this.chunks.length - 1] || '');
  }

  get chunkCount() {
    return $derived(this.chunks.length);
  }

  get streaming() {
    return this.isStreaming;
  }

  get paused() {
    return this.isPaused;
  }

  get hasError() {
    return this.error !== null;
  }

  get streamError() {
    return this.error;
  }

  get streamMetrics() {
    return this.metrics;
  }

  /**
   * Start streaming from a ReadableStream
   */
  async streamFrom(stream: ReadableStream<Uint8Array | string>) {
    try {
      this.reset();
      this.isStreaming = true;
      this.metrics.startTime = Date.now();

      // Handle both text and binary streams
      const textStream = stream instanceof ReadableStream && stream.constructor.name === 'ReadableStream' 
        ? stream.pipeThrough(new TextDecoderStream())
        : stream as ReadableStream<string>;

      this.reader = textStream.getReader();

      while (true) {
        // Apply backpressure if needed
        if (this.options.autoBackpressure && this.chunks.length >= this.options.bufferSize) {
          this.pause();
          await this.waitForBuffer();
        }

        // Wait while paused
        while (this.isPaused) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        const { done, value } = await this.reader.read();
        
        if (done) break;

        if (value) {
          this.addChunk(value);
        }
      }

      this.complete();
    } catch (err) {
      this.handleError(err as Error);
    }
  }

  /**
   * Stream from an async generator
   */
  async streamFromGenerator(generator: AsyncGenerator<string>) {
    try {
      this.reset();
      this.isStreaming = true;
      this.metrics.startTime = Date.now();

      for await (const chunk of generator) {
        // Apply backpressure if needed
        if (this.options.autoBackpressure && this.chunks.length >= this.options.bufferSize) {
          this.pause();
          await this.waitForBuffer();
        }

        // Wait while paused
        while (this.isPaused) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        this.addChunk(chunk);
      }

      this.complete();
    } catch (err) {
      this.handleError(err as Error);
    }
  }

  /**
   * Stream from a simulated API response (for demos)
   */
  async streamFromText(text: string, delay: number = 50) {
    const generator = async function* () {
      const words = text.split(' ');
      for (const word of words) {
        yield word + ' ';
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    };

    await this.streamFromGenerator(generator());
  }

  /**
   * Add a chunk to the stream
   */
  private addChunk(chunk: string) {
    this.chunks.push(chunk);
    this.metrics.chunksReceived++;
    this.metrics.bytesReceived += chunk.length;
    this.metrics.bufferUsage = this.chunks.length / this.options.bufferSize;
  }

  /**
   * Pause the stream
   */
  pause() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.metrics.isPaused = true;
    }
  }

  /**
   * Resume the stream
   */
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.metrics.isPaused = false;
    }
  }

  /**
   * Cancel the stream
   */
  async cancel() {
    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }
    this.isStreaming = false;
    this.metrics.endTime = Date.now();
  }

  /**
   * Reset the stream
   */
  reset() {
    this.chunks = [];
    this.isStreaming = false;
    this.isPaused = false;
    this.error = null;
    this.metrics = {
      chunksReceived: 0,
      bytesReceived: 0,
      isPaused: false,
      bufferUsage: 0,
      startTime: Date.now()
    };
  }

  /**
   * Clear consumed chunks (for memory management)
   */
  clearConsumedChunks(keepLast: number = 10) {
    if (this.chunks.length > keepLast) {
      const removed = this.chunks.splice(0, this.chunks.length - keepLast);
      // Update metrics
      this.metrics.bufferUsage = this.chunks.length / this.options.bufferSize;
    }
  }

  /**
   * Wait for buffer space
   */
  private async waitForBuffer() {
    while (this.chunks.length >= this.options.bufferSize) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.resume();
  }

  /**
   * Complete the stream
   */
  private complete() {
    this.isStreaming = false;
    this.metrics.endTime = Date.now();
    this.options.onComplete();
  }

  /**
   * Handle stream errors
   */
  private handleError(err: Error) {
    this.error = err;
    this.isStreaming = false;
    this.metrics.endTime = Date.now();
    this.options.onError(err);
  }

  /**
   * Get stream duration in milliseconds
   */
  get duration() {
    return $derived(
      this.metrics.endTime 
        ? this.metrics.endTime - this.metrics.startTime
        : Date.now() - this.metrics.startTime
    );
  }

  /**
   * Get streaming rate (chars/second)
   */
  get streamingRate() {
    return $derived(
      this.duration > 0 
        ? (this.metrics.bytesReceived / this.duration) * 1000
        : 0
    );
  }
}

/**
 * Create a reactive stream instance
 */
export function createReactiveStream(options?: StreamOptions) {
  return new ReactiveStream(options);
}