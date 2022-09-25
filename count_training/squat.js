
let video;
let poseNet;
let poses = [];
let count = 0;
let usercount = 1;
let flag = false;
let minflag = false;
let NGflag = false;
let nextpage = false;
let stratup = false;
let flexiontext1;
let flexiontext2;

let rcheck = 0;
let lcheck = 0;

let timer = 0;
let Notes = "体全体を映してください";
let statusmode = "読み込み中";

let setup_finish_flag = false;

const NOSE = 0;
const LEFTEYE = 1;
const RIGHTEYE = 2;
const LEFTEAR = 3;
const RIGHTEAR = 4;
const LEFTSHOULDER = 5;
const RIGHTSHOULDER = 6;
const LEFTELBOW = 7;
const RIGHTELBOW = 8;
const LEFTWRIST = 9;
const RIGHTWRIST = 10;
const LEFTHIP = 11;
const RIGHTHIP = 12;
const LEFTKNEE = 13;
const RIGHTKNEE = 14;
const LEFTANKLE = 15;
const RIGHTANKLE = 16;

function setup() {

    if ((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {
        createCanvas(screen.width, screen.height);//スマホ処理
    }else {
        createCanvas(760, 540);//PC処理
    }
    video = createCapture(VIDEO);
    video.size(width, height);
    console.log(width,height);

    // Create a new poseNet method with a single detection
    poseNet = ml5.poseNet(video, "single", modelReady);
    // This sets up an event that fills the global variable "poses"
    // with an array every time new poses are detected
    poseNet.on("pose", function (results) {
        poses = results;
    });
    // Hide the video element, and just show the canvas
    video.hide();
}

function modelReady() {
    select("#status").html("OK");
}

function draw() {
    image(video, 0, 0, width, height);

    // We can call both functions to draw all keypoints and the skeletons
    drawKeypoints();
    drawSkeleton();

    Kneeangledraw();

    starsetup();

    counter();

    //ifカウント以上で色変更
    if (count < usercount) {
        fill(255, 255, 255);
        stroke(30);
        textSize(30);
        textAlign(LEFT);
        text(count + "回目", 1, 20);
    } else {
        setup_finish_flag = false;

        //カウント
        fill(255, 0, 0);
        stroke(30);
        textSize(30);
        textAlign(LEFT);
        text(count + "回目", 1, 20);

        //カウントが指定回数を越すと完了コメント
        fill(255, 0, 0);
        stroke(30);
        textSize(30);
        textAlign(CENTER, CENTER);
        text("目標達成", width / 2, height / 2);
    }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i += 1) {
        // For each pose detected, loop through all the keypoints
        const pose = poses[i].pose;
        for (let j = 0; j < pose.keypoints.length; j += 1) {
            // A keypoint is an object describing a body part (like rightArm or leftShoulder)
            const keypoint = pose.keypoints[j];
            // Only draw an ellipse is the pose probability is bigger than 0.2
            if (keypoint.score > 0.6) {
                fill(255, 255, 255);
                stroke(30);
                ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
                //鼻を中心に顔を隠す
                fill(255, 0, 0);
                ellipse(pose.nose.x, pose.nose.y, 200);
            }
        }
    }
}

// A function to draw the skeletons
function drawSkeleton() {
    // Loop through all the skeletons detected
    for (let i = 0; i < poses.length; i += 1) {
        const skeleton = poses[i].skeleton;
        // For every skeleton, loop through all body connections
        for (let j = 0; j < skeleton.length; j += 1) {
            const partA = skeleton[j][0];
            const partB = skeleton[j][1];
            stroke(255, 255, 255);
            line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
    }
}

function starsetup() { //推定開始までのカウントダウン

    fill(255, 0, 0);
    stroke(30);
    textSize(50);
    textAlign(CENTER, CENTER);
    text(Notes, width / 2, height / 2 );

    fill(255, 255, 255);
    stroke(30);
    textSize(30);
    textAlign(RIGHT, RIGHT);
    text(statusmode + timer, width, 20);

    if( setup_finish_flag == true){
        fill(255, 255, 255);
        stroke(30);
        textSize(30);
        textAlign(RIGHT, RIGHT);
        text("推定中", width, 20);
    }

    for (let i = 0; i < poses.length; i += 1) {
        const pose = poses[i].pose;
        for (let j = 0; j < pose.keypoints.length; j += 1) {
            if (pose.score > 0.8) {
                if (frameCount % 60 == 0 && timer < 100) {
                    timer += 1;
                } else if (timer > 100){
                    break;
                }
            }
            if (pose.score < 0.8) {
                if (frameCount % 60 == 0 && timer > 0) {
                    timer --;
                }
            }
        }
    }

    if (timer  >= 100) {
        Notes = " ";
        timer = " ";
        statusmode = " ";
        setup_finish_flag = true;
    }
} 

//"Uncaught RangeError: Maximum call stack size exceeded" の原因分からず

// function poseangle(keypoints) {
//     anglekeisan(
//         keypoints, RIGHTHIP, RIGHTKNEE, RIGHTANKLE,
//     );
// }

// function anglekeisan(keypoints, HIP, KNEE, ANKLE) {

//     const P1 = {
//         x: keypoints[HIP].position.x,
//         y: keypoints[HIP].position.y,
//     };
//     const P2 = {
//         x: keypoints[KNEE].position.x,
//         y: keypoints[KNEE].position.y,
//     };
//     const P3 = {
//         x: keypoints[ANKLE].position.x, 
//         y: keypoints[ANKLE].position.y,
//     };

//     //3点座標から角度を計算
//     let flexion = (
//         Math.atan2(
//             P3.y - P1.y,
//             P3.x - P1.x
//         )
//         - Math.atan2(
//             P2.y - P1.y,
//             P2.x - P1.x
//         )
//     ) * (180 / Math.PI);
//     flexion = Math.abs(flexion);
//     if (flexion > 180) {
//         flexion = Math.abs(flexion - 360);
//     }

//     console.log(flexion);
// }

function Kneeangledraw(flexiontext1,flexiontext2) {

    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i += 1) {
        // For each pose detected, loop through all the keypoints
        const pose = poses[i].pose;
        for (let j = 0; j < pose.keypoints.length; j += 1) {
            // A keypoint is an object describing a body part (like rightArm or leftShoulder)
            const keypoint = pose.keypoints[j];
            // Only draw an ellipse is the pose probability is bigger than 0.2
            if (pose.keypoints[RIGHTKNEE].score > 0.6 && pose.keypoints[RIGHTANKLE].score > 0.6 && pose.keypoints[RIGHTHIP].score > 0.6) {
                //右

                const P1 = {
                    x: pose.keypoints[RIGHTKNEE].position.x,
                    y: pose.keypoints[RIGHTKNEE].position.y,

                };
                const P2 = {
                    x: pose.keypoints[RIGHTANKLE].position.x,
                    y: pose.keypoints[RIGHTANKLE].position.y,
                };
                const P3 = {
                    x: pose.keypoints[RIGHTHIP].position.x,
                    y: pose.keypoints[RIGHTHIP].position.y,
                };

                //3点座標から角度を計算
                let flexion = (
                    Math.atan2(
                        P3.y - P1.y,
                        P3.x - P1.x
                    )
                    - Math.atan2(
                        P2.y - P1.y,
                        P2.x - P1.x
                    )
                ) * (180 / Math.PI);
                flexion = Math.abs(flexion);
                if (flexion > 180) {
                    flexion = Math.abs(flexion - 360);
                }

                //小数点切り捨て
                flexiontext1 = Math.floor(flexion);

                // console.log(flexiontext1);

                //円を描画
                fill(0, 0, 0);
                ellipse(pose.keypoints[RIGHTKNEE].position.x, pose.keypoints[RIGHTKNEE].position.y, 50);

                //角度を描画
                fill(255, 255, 255);
                stroke(30);
                textSize(30);
                textFont('sans-serif');
                text(flexiontext1 + "°", pose.keypoints[RIGHTKNEE].position.x, pose.keypoints[RIGHTKNEE].position.y);
            }
            if (pose.keypoints[LEFTKNEE].score > 0.6 && pose.keypoints[LEFTANKLE].score > 0.6 && pose.keypoints[LEFTHIP].score > 0.6) {
                //左

                const O1 = {
                    x: pose.keypoints[LEFTKNEE].position.x,
                    y: pose.keypoints[LEFTKNEE].position.y,
                };
                const O2 = {
                    x: pose.keypoints[LEFTANKLE].position.x,
                    y: pose.keypoints[LEFTANKLE].position.y,
                };
                const O3 = {
                    x: pose.keypoints[LEFTHIP].position.x,
                    y: pose.keypoints[LEFTHIP].position.y,
                };

                //3点座標から角度を計算
                let flexion2 = (
                    Math.atan2(
                        O3.y - O1.y,
                        O3.x - O1.x
                    )
                    - Math.atan2(
                        O2.y - O1.y,
                        O2.x - O1.x
                    )
                ) * (180 / Math.PI);
                flexion2 = Math.abs(flexion2);
                if (flexion2 > 180) {
                    flexion2 = Math.abs(flexion2 - 360);
                }

                //小数点切り捨て
                flexiontext2 = Math.floor(flexion2);

                // console.log(flexiontext2);

                //円を描画
                fill(0, 0, 0);
                ellipse(pose.keypoints[LEFTKNEE].position.x, pose.keypoints[LEFTKNEE].position.y, 30);

                //角度を描画
                fill(255, 255, 255);
                stroke(30);
                textSize(30);
                textFont('sans-serif');
                text(flexiontext2 + "°", pose.keypoints[LEFTKNEE].position.x, pose.keypoints[LEFTKNEE].position.y);

            }
            counter(flexiontext1, flexiontext2);
        }
    }
}

function counter(angle1, angle2) {
    // setTimeout(() => { //準備完了までカウント無効(とりあえず10秒設定)
    //     console.log("setup");
    // console.log(setup_finish_flag);

            usercount = document.form.count.value; //htmlから目標回数を取得
            // console.log(usercount);
        if(angle1 > 175 && angle2 > 175){
            stratup = true;
        }
        if(stratup == true && setup_finish_flag == true){
            if ((angle1 <= 90 && flag == false)&&(angle2 <= 90 && flag == false)) {
                flag = true;
                minflag = false;
                NGflag = false;
            }else if ((angle1 >= 170 && flag == true)||(angle2 >= 170 && flag == true)) {
                count += 1; //体制を戻した時にカウント
                flag = false; 
            } else if ((angle1 < 120 && angle1 > 90 && flag == false && minflag == false) || (angle2 < 120 && angle2 > 90 && flag == false && minflag == false)){
                minflag = true;
            } else if ((angle1 > 170 && flag == false && minflag == true) || (angle2 > 170 && flag == false && minflag == true)){
                NGflag = true //膝関節角度が90°未満に達していない状態で上体を起こすと警告を表示
            }
        }
    // }, 10000);

        
    if (NGflag == true) {
        fill(255, 0, 0);
        stroke(30);
        textSize(50);
        textAlign(CENTER, CENTER);
        text("ひざ が あさいよ", 320, 240);
    }
        setTimeout(() =>{ //目標達成後の画面遷移フラグ(5秒後)
            // console.log("Execution 5sec");
            // console.log(nextpage);
            nextpage = true;
            // location.href = "result.html";
        }, 5000);
    }

