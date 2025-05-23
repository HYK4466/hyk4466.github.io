/*-------------------------------------------------------------------------
07_LineSegments.js

left mouse button을 click하면 선분을 그리기 시작하고, 
button up을 하지 않은 상태로 마우스를 움직이면 임시 선분을 그리고, 
button up을 하면 최종 선분을 저장하고 임시 선분을 삭제함.

임시 선분의 color는 회색이고, 최종 선분의 color는 빨간색임.

이 과정을 반복하여 여러 개의 선분 (line segment)을 그릴 수 있음. 
---------------------------------------------------------------------------*/
import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

// Global variables
let isInitialized = false; // global variable로 event listener가 등록되었는지 확인
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let vao;
let positionBuffer;
let pointBuffer;
let isDrawing = false;
let isCircle = false;
let startPoint = [0.0, 0.0];
let tempEndPoint = [0.0, 0.0];
let segStartPoint = null;
let segEndPoint = null;
let lines = [];
let textOverlay;
let textOverlay2;
let textOverlay3;
let radius = 0;
let axes = new Axes(gl, 0.85);
let isFinished =false;
let intersection = []

// DOMContentLoaded event
// 1) 모든 HTML 문서가 완전히 load되고 parsing된 후 발생
// 2) 모든 resource (images, css, js 등) 가 완전히 load된 후 발생
// 3) 모든 DOM 요소가 생성된 후 발생
// DOM: Document Object Model로 HTML의 tree 구조로 표현되는 object model 
// 모든 code를 이 listener 안에 넣는 것은 mouse click event를 원활하게 처리하기 위해서임

// mouse 쓸 때 main call 방법
document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => { // call main function
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.7, 0.8, 0.9, 1.0);
    
    return true;
}

function setupCanvas() {
    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.2, 0.3, 1.0);
}

function setupBuffers(shader) {
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    shader.setAttribPointer('a_position', 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
}

// 좌표 변환 함수: 캔버스 좌표를 WebGL 좌표로 변환
// 캔버스 좌표: 캔버스 좌측 상단이 (0, 0), 우측 하단이 (canvas.width, canvas.height)
// WebGL 좌표 (NDC): 캔버스 좌측 상단이 (-1, 1), 우측 하단이 (1, -1)
function convertToWebGLCoordinates(x, y) {
    return [
        (x / canvas.width) * 2 - 1,
        -((y / canvas.height) * 2 - 1)
    ];
}

/* 
    browser window
    +----------------------------------------+
    | toolbar, address bar, etc.             |
    +----------------------------------------+
    | browser viewport (컨텐츠 표시 영역)       | 
    | +------------------------------------+ |
    | |                                    | |
    | |    canvas                          | |
    | |    +----------------+              | |
    | |    |                |              | |
    | |    |      *         |              | |
    | |    |                |              | |
    | |    +----------------+              | |
    | |                                    | |
    | +------------------------------------+ |
    +----------------------------------------+

    *: mouse click position

    event.clientX = browser viewport 왼쪽 경계에서 마우스 클릭 위치까지의 거리
    event.clientY = browser viewport 상단 경계에서 마우스 클릭 위치까지의 거리
    rect.left = browser viewport 왼쪽 경계에서 canvas 왼쪽 경계까지의 거리
    rect.top = browser viewport 상단 경계에서 canvas 상단 경계까지의 거리

    x = event.clientX - rect.left  // canvas 내에서의 클릭 x 좌표
    y = event.clientY - rect.top   // canvas 내에서의 클릭 y 좌표
*/

function setupMouseEvents() {
    function handleMouseDown(event) {
        event.preventDefault(); // 존재할 수 있는 기본 동작을 방지
        event.stopPropagation(); // event가 상위 요소로 전파되지 않도록 방지

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (!isDrawing && !isFinished) { // 1번 또는 2번 선분을 그리고 있는 도중이 아닌 경우
            // 캔버스 좌표를 WebGL 좌표로 변환하여 선분의 시작점을 설정
            let [glX, glY] = convertToWebGLCoordinates(x, y);
            if (isCircle) {
                segStartPoint = [glX, glY];
            }
            else {
                startPoint = [glX, glY];
            }
            isDrawing = true; // 이제 mouse button을 놓을 때까지 계속 true로 둠. 
        }
    }

    function handleMouseMove(event) {
        if (isDrawing && !isFinished) { // 1번 또는 2번 선분을 그리고 있는 도중인 경우
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            let [glX, glY] = convertToWebGLCoordinates(x, y);
            if (isCircle) {
                segEndPoint = [glX, glY];
            }
            else {
                tempEndPoint = [glX, glY];
            }
            render();
        }
    }

    function handleMouseUp() {
        if (isDrawing && tempEndPoint) {
            if (!isFinished) {
                isDrawing = false;
                if (!isCircle) {
                    radius = Math.sqrt( Math.pow(startPoint[0] - tempEndPoint[0], 2) + Math.pow(startPoint[1] - tempEndPoint[1], 2) );
                    updateText(textOverlay, "Circle: center (" + startPoint[0].toFixed(2) + ", " + startPoint[1].toFixed(2) + ") radius = " + radius.toFixed(2));
                    isCircle = true;
                }
                if (isCircle && segStartPoint != null) {
                    updateText(textOverlay2, "Line segment: (" + segStartPoint[0].toFixed(2) + ", " + segStartPoint[1].toFixed(2) + ") ~ (" + segEndPoint[0].toFixed(2) + ", " + segEndPoint[1].toFixed(2) + ")");
                    isFinished = true;
                    radius = Math.sqrt( Math.pow(startPoint[0] - tempEndPoint[0], 2) + Math.pow(startPoint[1] - tempEndPoint[1], 2) );

                    //get parametric line
                    //f = startPoint + t * (final - start)
                    let a = segEndPoint[0] - segStartPoint[0];
                    let b = segStartPoint[0];
                    let c = segEndPoint[1] - segStartPoint[1];
                    let d = segStartPoint[1];
                    let A = Math.pow(a, 2) + Math.pow(c, 2);
                    let B = 2 * (a*b - a*startPoint[0] + c*d - c*startPoint[1]);
                    let C = Math.pow(b,2) + Math.pow(d,2) + Math.pow(startPoint[0], 2) + Math.pow(startPoint[1], 2) - Math.pow(radius, 2) - 2*(b*startPoint[0] + d*startPoint[1]);
                    let t1 = null;
                    let t2 = null;
                    let dis = Math.pow(B, 2) - 4*A*C;
                    if (dis > 0) {
                        //Two roots
                        t1 = (-B + Math.sqrt(dis)) / (2*A);
                        t2 = (-B - Math.sqrt(dis)) / (2*A);
                        if (t1 >=0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
                            let x1 = segStartPoint[0] + t1*(segEndPoint[0] - segStartPoint[0]);
                            let y1 = segStartPoint[1] + t1*(segEndPoint[1] - segStartPoint[1]);
                            let x2 = segStartPoint[0] + t2*(segEndPoint[0] - segStartPoint[0]);
                            let y2 = segStartPoint[1] + t2*(segEndPoint[1] - segStartPoint[1]);
                            intersection = [x1, y1, x2, y2];
                            updateText(textOverlay3, "Intersection Points: 2 Point 1: (" + x1.toFixed(2) + ", " + y1.toFixed(2) + ") Point 2: (" + x2.toFixed(2) + ", " + y2.toFixed(2) + ")");
                        }   
                        else if (t1 >=0 && t1 <= 1) {
                            let x1 = segStartPoint[0] + t1*(segEndPoint[0] - segStartPoint[0]);
                            let y1 = segStartPoint[1] + t1*(segEndPoint[1] - segStartPoint[1]);    
                            intersection = [x1, y1];
                            updateText(textOverlay3, "Intersection Points: 1 Point 1: (" + x1.toFixed(2) + ", " + y1.toFixed(2) + ")");
                        }
                        else if (t2 >= 0 && t2 <= 1) {
                            let x2 = segStartPoint[0] + t2*(segEndPoint[0] - segStartPoint[0]);
                            let y2 = segStartPoint[1] + t2*(segEndPoint[1] - segStartPoint[1]);
                            intersection = [x2, y2];
                            updateText(textOverlay3, "Intersection Points: 1 Point 1: (" + x2.toFixed(2) + ", " + y2.toFixed(2) + ")");

                        }
                        else {
                            updateText(textOverlay3, "No intersection");
                        }
                        
                    }
                    else if (dis == 0) {
                        t1 = (-B) / (2*A);
                        let x1 = segStartPoint[0] + t1*(segEndPoint[0] - segStartPoint[0]);
                        let y1 = segStartPoint[1] + t1*(segEndPoint[1] - segStartPoint[1]);
                        updateText(textOverlay3, "Intersection Points: 1 Point 1: (" + x1.toFixed(2) + ", " + y1.toFixed(2) + ")");
                    }
                    else {
                        updateText(textOverlay3, "No intersection");
                    }
                }
                render();
            }
        }
    }

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    axes.draw(mat4.create(), mat4.create());

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    shader.use();

        // axes 그리기

    //(a+rcos(), b+rsins())
    let center = startPoint;
    let curr_point = tempEndPoint;
    radius = Math.sqrt( Math.pow(curr_point[0] - center[0], 2) + Math.pow(curr_point[1] - center[1], 2) );
    for (let i = 1; i <=360; i++) {
        let next_point = [center[0] + radius*Math.cos(i * Math.PI/180), center[1] + radius*Math.sin(i*Math.PI/180)];
        let init_point = [center[0] + radius*Math.cos((i-1) * Math.PI/180), center[1] + radius*Math.sin((i-1)*Math.PI/180)];
        lines = [init_point[0], init_point[1], next_point[0], next_point[1]];
        shader.setVec4("u_color", [1.0, 0.0, 1.0, 1.0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINES, 0, 2);
        curr_point = next_point;    
    }

    

    if (isCircle) {
        shader.setVec4("u_color", [1.0, 0.5, 0.5, 1.0]); // 임시 선분의 color는 회색
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...segStartPoint, ...segEndPoint]), 
                      gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINES, 0, 2);

        if (intersection.length == 4) {
            shader.setVec4("u_color", [1.0, 1.0, 0.0, 1.0]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(intersection), gl.STATIC_DRAW);
            gl.bindVertexArray(vao);
            gl.drawArrays(gl.POINTS, 0, 2);
        }
        else if (intersection.length == 2) {
            shader.setVec4("u_color", [1.0, 1.0, 0.0, 1.0]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(intersection), gl.STATIC_DRAW);
            gl.bindVertexArray(vao);
            gl.drawArrays(gl.POINTS, 0, 1);

        }
    }


}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }

        // 셰이더 초기화
        shader = await initShader();
        
        // 나머지 초기화
        setupCanvas();
        setupBuffers(shader);
        shader.use();

        // 텍스트 초기화
        textOverlay = setupText(canvas, "", 1);
        textOverlay2 = setupText(canvas, "", 2);
        textOverlay3 = setupText(canvas, "", 3);
        
        // 마우스 이벤트 설정
        setupMouseEvents();
        
        // 초기 렌더링
        render();

        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}
