/*-----------------------------------------------------------------------------
class RegularOctahedron

1) Vertex positions
    A regular octahedron has 6 vertices and 8 triangular faces
    The vertices are arranged as follows:
        top (0,1,0)
        bottom (0,-1,0)
        front (0,0,1)
        back (0,0,-1)
        right (1,0,0)
        left (-1,0,0)

2) Vertex indices
    The 8 triangular faces are:
        top-front-right, top-right-back, top-back-left, top-left-front
        bottom-front-right, bottom-right-back, bottom-back-left, bottom-left-front

3) Vertex normals
    Each vertex normal points outward from the center
    The normal vector is the same as the vertex position (normalized)

4) Vertex colors
    Each face has a different color for better visualization
-----------------------------------------------------------------------------*/

export class RegularOctahedron {
    constructor(gl, options = {}) {
        this.gl = gl;
        
        // Creating VAO and buffers
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();



        this.normals = new Float32Array([
            // Top vertex normal
            0, 1, 0,
            // Bottom vertex normal
            0, -1, 0,
            // Front vertex normal
            0, 0, 1,
            // Back vertex normal
            0, 0, -1,
            // Right vertex normal
            1, 0, 0,
            // Left vertex normal
            -1, 0, 0
        ]); 

        // if color is provided, set all vertices' color to the given color
        if (options.color) {
            this.colors = new Float32Array(24); // 6 vertices * 4 components (RGBA)
            for (let i = 0; i < 24; i += 4) {
                this.colors[i] = options.color[0];
                this.colors[i+1] = options.color[1];
                this.colors[i+2] = options.color[2];
                this.colors[i+3] = options.color[3];
            }
        }
        else {
            this.colors = new Float32Array([
                // Top vertex - white
                1, 1, 1, 1,
                // Bottom vertex - white
                1, 1, 1, 1,
                // Front vertex - red
                1, 0, 0, 1,
                // Back vertex - green
                0, 1, 0, 1,
                // Right vertex - blue
                0, 0, 1, 1,
                // Left vertex - yellow
                1, 1, 0, 1
            ]);
        }

        this.indices = new Uint16Array([
            // Top faces
            0, 1, 2,  // top-front-right
            3, 4, 5,  // top-right-back
            6, 7, 8,  // top-back-left
            9, 10, 11,  // top-left-front
            // Bottom faces
            12, 13, 14,  // bottom-front-right
            15, 16, 17,  // bottom-right-back
            18, 19, 20,  // bottom-back-left
            21, 22, 23  // bottom-left-front
        ]);

        let a = Math.sqrt(2) / 2;

        // Initializing data
        this.vertices = new Float32Array([
            0, a, 0,     0.5, 0, 0.5,      0.5, 0, -0.5,
            0, a, 0,     0.5, 0, -0.5,      -0.5, 0, -0.5,
            0, a, 0,     -0.5, 0, -0.5,      -0.5, 0, 0.5,
            0, a, 0,     -0.5, 0, 0.5,      0.5, 0, 0.5,

            0, -a, 0,     0.5, 0, 0.5,      0.5, 0, -0.5,
            0, -a, 0,     0.5, 0, -0.5,      -0.5, 0, -0.5,
            0, -a, 0,     -0.5, 0, -0.5,      -0.5, 0, 0.5,
            0, -a, 0,     -0.5, 0, 0.5,      0.5, 0, 0.5,

        ]);

        this.sameVertices = new Uint16Array([
            0, 3, 6, 9,
            1, 11, 13, 23,
            2, 4, 14, 16,
            5, 7, 17, 19,
            8, 10, 20, 22,

            12, 15, 18, 21,
        ]);

        this.texCoords = new Float32Array([
            0.125, 1,    0, 0.5,     0.25, 0.5,
            0.375,1,    0.25,0.5, 0.5,0.5,
            0.625,1,  0.5,0.5,   0.75,0.5,
            0.875,1,  0.75,0.5, 1,0.5,

            0.125,0,    0, 0.5,     0.25, 0.5,
            0.375,0,    0.25,0.5, 0.5,0.5,
            0.625,0,  0.5,0.5,   0.75,0.5,
            0.875,0,  0.75,0.5, 1,0.5,
        ]);

        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;

        // Calculate buffer sizes
        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;
        const tSize = this.texCoords.byteLength;
        const totalSize = vSize + nSize + cSize + tSize;

        gl.bindVertexArray(this.vao);

        // Copy data to VBO
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize + cSize, this.texCoords);


        // Copy indices to EBO
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // Set up vertex attributes
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);  // position
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize);  // normal
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize);  // color
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize);  // texCoord

        // Enable vertex attributes
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        // Unbind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, 24, gl.UNSIGNED_SHORT, 0); // 8 triangles * 3 vertices = 24
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
} 