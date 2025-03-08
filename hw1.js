// Global constants
const canvas = document.getElementById('glCanvas'); // Get the canvas element 

const gl = canvas.getContext('webgl2'); // Get the WebGL2 context


if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size: 현재 window 전체를 canvas로 사용
canvas.width = 500;
canvas.height = 500;


// Initialize WebGL settings: viewport and clear color
gl.viewport(0, 0, canvas.width/2, canvas.height/2);
gl.clearColor(0,0,1,1)
render(0,0)

gl.viewport(0, canvas.height/2, canvas.width/2, canvas.height/2)
gl.clearColor(1,0,0,1)
render(0, canvas.height/2)

gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height/2)
gl.clearColor(1,1,0,1)
render(canvas.width/2, 0)

gl.viewport(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2)
gl.clearColor(0,1,0,1)
render(canvas.width/2, canvas.height/2)


// Render loop
function render(x, y) {
    gl.enable(gl.SCISSOR_TEST)
    gl.scissor(x,y, canvas.width/2, canvas.height/2)
    gl.clear(gl.COLOR_BUFFER_BIT);  
    gl.disable(gl.SCISSOR_TEST)  
    // Draw something here
}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
    var size = 500
    if (size > window.innerHeight) {
        size = window.innerHeight
    }
    if (size > window.innerWidth) {
        size = window.innerWidth
    }

    canvas.width = size;
    canvas.height = size;
    gl.viewport(0, 0, canvas.width/2, canvas.height/2);
    gl.clearColor(0,0,1,1)
    render(0,0)

    gl.viewport(0, canvas.height/2, canvas.width/2, canvas.height/2)
    gl.clearColor(1,0,0,1)
    render(0, canvas.height/2)

    gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height/2)
    gl.clearColor(1,1,0,1)
    render(canvas.width/2, 0)

    gl.viewport(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2)
    gl.clearColor(0,1,0,1)
    render(canvas.width/2, canvas.height/2)

});