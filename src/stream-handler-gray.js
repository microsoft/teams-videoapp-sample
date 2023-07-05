export class StreamHandlerGrayFilter {
  constructor() {
    this.canvas = document.createElement("canvas");
    // create a WebGL2 context
    this.gl = this.canvas.getContext("webgl2");

    if (!this.gl) {
      throw new Error("WebGL2 not supported");
    }
    this._setupShaders();
    this._setupBuffers();
  }

  _setupShaders() {
    const { gl } = this;
    
    // create vertex shader
    const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
        gl_Position = vec4(a_position, 0, 1);
        v_texCoord = a_texCoord;
    }
`;
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) {
      throw new Error("Failed to create vertex shader");
    }
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    // create fragment shader
    const fragmentShaderSource = `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_texCoord;
    void main() {
        vec4 color = texture2D(u_texture, v_texCoord);
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor = vec4(vec3(gray), color.a);
    }
`;
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) {
      throw new Error("Failed to create fragment shader");
    }
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // create program
    const program = gl.createProgram();
    if (!program) {
      throw new Error("Failed to create program");
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
          program
        )}`
      );
    }
    gl.useProgram(program);
    this.program = program;
  }

  _setupBuffers() {
    const { gl, program } = this;

    if (!program) {
      throw new Error("Program not initialized");
    }
    // create buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    // create attributes
    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
      gl.STATIC_DRAW
    );

    const texCoordAttributeLocation = gl.getAttribLocation(
      program,
      "a_texCoord"
    );
    gl.enableVertexAttribArray(texCoordAttributeLocation);
    gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  }

  async processVideoFrame(videoFrame) {
    try {
      const { gl, program } = this;

      if (!program) {
        throw new Error("Program not initialized");
      }

      const imageBitmap = await createImageBitmap(videoFrame, {imageOrientation: "flipY"}/* We need this otherwise the frame is rendered upside down */);

      this.canvas.width = imageBitmap.width;
      this.canvas.height = imageBitmap.height;
      this.gl.viewport(0, 0, imageBitmap.width, imageBitmap.height);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        imageBitmap.width,
        imageBitmap.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        imageBitmap
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      // set uniforms
      const textureUniformLocation = gl.getUniformLocation(
        program,
        "u_texture"
      );
      gl.uniform1i(textureUniformLocation, 0);

      // draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      return new VideoFrame(this.canvas, {
        timestamp: videoFrame.timestamp,
        displayHeight: videoFrame.displayHeight,
        displayWidth: videoFrame.displayWidth,
      });
    } catch (e) {
      console.error(e);
      Promise.reject(e);
    }
  }
}
