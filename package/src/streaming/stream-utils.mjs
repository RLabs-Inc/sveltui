// @bun
// src/streaming/stream-utils.ts
async function responseToStream(response) {
  if (!response.body) {
    throw new Error("Response has no body");
  }
  return response.body;
}
function textToStream(text, options = {}) {
  const { chunkSize = 10, delay = 50 } = options;
  return new ReadableStream({
    async start(controller) {
      let position = 0;
      while (position < text.length) {
        const chunk = text.slice(position, position + chunkSize);
        controller.enqueue(chunk);
        position += chunkSize;
        if (delay > 0 && position < text.length) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      controller.close();
    }
  });
}
function createMockClaudeStream(content, options = {}) {
  const {
    model = "claude-3-opus-20240229",
    streamDelay = 30,
    chunkVariance = true
  } = options;
  return new ReadableStream({
    async start(controller) {
      controller.enqueue(`data: {"type":"message_start","message":{"model":"${model}"}}

`);
      await new Promise((resolve) => setTimeout(resolve, streamDelay));
      controller.enqueue(`data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

`);
      await new Promise((resolve) => setTimeout(resolve, streamDelay));
      const words = content.split(" ");
      let accumulated = "";
      for (let i = 0;i < words.length; i++) {
        const word = words[i];
        accumulated += (i > 0 ? " " : "") + word;
        const chunkWords = chunkVariance ? Math.floor(Math.random() * 3) + 1 : 1;
        let chunk = word;
        for (let j = 1;j < chunkWords && i + j < words.length; j++) {
          chunk += " " + words[i + j];
          accumulated += " " + words[i + j];
          i++;
        }
        controller.enqueue(`data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"${chunk.replace(/"/g, "\\\"")}"}}

`);
        const delay = chunkVariance ? streamDelay + Math.random() * streamDelay : streamDelay;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      controller.enqueue(`data: {"type":"content_block_stop","index":0}

`);
      await new Promise((resolve) => setTimeout(resolve, streamDelay));
      controller.enqueue(`data: {"type":"message_delta","delta":{"stop_reason":"end_turn"}}

`);
      controller.enqueue(`data: {"type":"message_stop"}

`);
      controller.close();
    }
  });
}
async function* parseSSEStream(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder;
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(`
`);
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]")
            continue;
          try {
            const parsed = JSON.parse(data);
            yield parsed;
          } catch (e) {}
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
function createBackpressureStream(source, options = {}) {
  const {
    highWaterMark = 100,
    lowWaterMark = 50,
    onPressure = () => {}
  } = options;
  let buffer = [];
  let paused = false;
  let sourceReader = null;
  return new ReadableStream({
    async start(controller) {
      sourceReader = source.getReader();
      (async () => {
        try {
          while (true) {
            if (buffer.length >= highWaterMark && !paused) {
              paused = true;
              onPressure(true);
            } else if (buffer.length <= lowWaterMark && paused) {
              paused = false;
              onPressure(false);
            }
            if (paused) {
              await new Promise((resolve) => setTimeout(resolve, 100));
              continue;
            }
            const { done, value } = await sourceReader.read();
            if (done) {
              while (buffer.length > 0) {
                controller.enqueue(buffer.shift());
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
      if (buffer.length > 0) {
        controller.enqueue(buffer.shift());
      }
    },
    cancel() {
      if (sourceReader) {
        sourceReader.cancel();
      }
    }
  });
}
function mergeStreams(...streams) {
  return new ReadableStream({
    async start(controller) {
      const readers = streams.map((s) => s.getReader());
      const reading = new Set(readers);
      await Promise.all(readers.map(async (reader) => {
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
      }));
    }
  });
}
function transformStream(stream, transform) {
  return stream.pipeThrough(new TransformStream({
    async transform(chunk, controller) {
      try {
        const transformed = await transform(chunk);
        controller.enqueue(transformed);
      } catch (error) {
        controller.error(error);
      }
    }
  }));
}
function throttleStream(stream, bytesPerSecond, getSize = () => 1) {
  let lastTime = Date.now();
  let tokens = bytesPerSecond;
  return stream.pipeThrough(new TransformStream({
    async transform(chunk, controller) {
      const now = Date.now();
      const elapsed = now - lastTime;
      lastTime = now;
      tokens = Math.min(bytesPerSecond, tokens + elapsed / 1000 * bytesPerSecond);
      const size = getSize(chunk);
      while (tokens < size) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        const now2 = Date.now();
        const elapsed2 = now2 - lastTime;
        lastTime = now2;
        tokens = Math.min(bytesPerSecond, tokens + elapsed2 / 1000 * bytesPerSecond);
      }
      tokens -= size;
      controller.enqueue(chunk);
    }
  }));
}
function bufferStream(stream, size, timeout) {
  let buffer = [];
  let timer;
  return stream.pipeThrough(new TransformStream({
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
  }));
}
export {
  transformStream,
  throttleStream,
  textToStream,
  responseToStream,
  parseSSEStream,
  mergeStreams,
  createMockClaudeStream,
  createBackpressureStream,
  bufferStream
};
