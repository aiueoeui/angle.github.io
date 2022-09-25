
let video;
let poseNet;
let poses = [];
let count = 0;
let usercount = 1;
let rflag = false;
let lflag = false;
let minflag = false;
let NGflag = false;
let nextpage = false;
let tRKA;
let tLKA;
let tRHA;
let tLHA;
let rcheck = 0;
let lcheck = 0;
let timer = 10;
let Notes = "体全体を映してください";

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

function switchByWidth() {
    //レスポンシブ対応
    if (window.matchMedia('(max-width: 767px)').matches) {
        createCanvas(540, 760);//スマホ処理
        console.log("スマホ");
    } else if (window.matchMedia('(min-width:768px)').matches) {
        createCanvas(760, 540);//PC処理
        console.log("PC");
    }
}

function setup() {
    switchByWidth();

    video = createCapture(VIDEO);
    video.size(width, height);
    console.log("その場足踏み");

    // Create a new poseNet method with a single detection
    poseNet = ml5.poseNet(video, "single", modelReady);
    // console.log(poseNet);
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

    Draw_Knee_Hip_angle();

    starttimer();

    // カウントテキスト表示
    if (count < usercount) {
        fill(255, 255, 255);
        stroke(30);
        textSize(30);
        textAlign(LEFT);
        text("count " + count, 1, 20);
    } else { //ifカウント以上で色変更
        //カウント
        fill(255, 0, 0);
        stroke(30);
        textSize(30);
        textAlign(LEFT);
        text("count " + count, 1, 20);

        //カウントが指定回数を越すと完了コメント
        fill(255, 0, 0);
        stroke(30);
        textSize(30);
        textAlign(CENTER, CENTER);
        text("たっせい！", 320, 100);
    }

    setTimeout(() =>{ //準備完了までカウント無効(とりあえず10秒設定)
        console.log("setup");
        counter();

        if (rcheck > 2 || lcheck > 2) {
            fill(255, 0, 0);
            stroke(30);
            textSize(50);
            textAlign(CENTER, CENTER);
            text("ひざ が まがりすぎ かも", 320, 240);
    }
    }, 10000);
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
                ellipse(pose.nose.x, pose.nose.y, 300);
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

function starttimer(){ //推定開始までのカウントダウン
    fill(255, 0, 0);
    stroke(30);
    textSize(50);
    textAlign(CENTER, CENTER);
    text(Notes, width / 2, height / 2.5);
    text(timer, width/2, height/2);
    if (frameCount % 60 ==0 && timer > 0) {
        timer --;
    }
    if (timer == 0) {
        Notes = " ";
        timer = " ";
        fill(255, 255, 255);
        stroke(30);
        textSize(30);
        textAlign(RIGHT, RIGHT);
        text("推定中", width, 20);
    }
} 

function Draw_Knee_Hip_angle(tRKA, tLKA, tRHA, tLHA) {

    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i += 1) {
        // For each pose detected, loop through all the keypoints
        const pose = poses[i].pose;
        for (let j = 0; j < pose.keypoints.length; j += 1) {
            // A keypoint is an object describing a body part (like rightArm or leftShoulder)
            const keypoint = pose.keypoints[j];

            if (pose.keypoints[RIGHTKNEE].score > 0.6 && pose.keypoints[RIGHTANKLE].score > 0.6 && pose.keypoints[RIGHTHIP].score > 0.6 && pose.score > 0.5) {
                //右膝

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
                tRKA = Math.floor(flexion);

                // console.log(tRKA);

                //円を描画
                fill(0, 0, 0);
                ellipse(pose.keypoints[RIGHTKNEE].position.x, pose.keypoints[RIGHTKNEE].position.y, 15);

                //角度を描画
                fill(200, 200, 200);
                stroke(25);
                textSize(25);
                textFont('sans-serif');
                text(tRKA + "°", pose.keypoints[RIGHTKNEE].position.x, pose.keypoints[RIGHTKNEE].position.y);
            }
            if (pose.keypoints[LEFTKNEE].score > 0.6 && pose.keypoints[LEFTANKLE].score > 0.6 && pose.keypoints[LEFTHIP].score > 0.6 && pose.score > 0.5) {
                //左膝

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
                tLKA = Math.floor(flexion2);

                // console.log(flexiontext2);

                //円を描画
                fill(0, 0, 0);
                ellipse(pose.keypoints[LEFTKNEE].position.x, pose.keypoints[LEFTKNEE].position.y, 30);

                //角度を描画
                fill(255, 255, 255);
                stroke(30);
                textSize(30);
                textFont('sans-serif');
                text(tLKA + "°", pose.keypoints[LEFTKNEE].position.x, pose.keypoints[LEFTKNEE].position.y);

            }
            if (pose.keypoints[RIGHTHIP].score > 0.6 && pose.keypoints[RIGHTKNEE].score > 0.6 && pose.keypoints[RIGHTSHOULDER].score > 0.6 && pose.score > 0.6) {
                //右腰の角度

                const I1 = {
                    x: pose.keypoints[RIGHTHIP].position.x,
                    y: pose.keypoints[RIGHTHIP].position.y,
                };
                const I2 = {
                    x: pose.keypoints[RIGHTKNEE].position.x,
                    y: pose.keypoints[RIGHTKNEE].position.y,
                };
                const I3 = {
                    x: pose.keypoints[RIGHTSHOULDER].position.x,
                    y: pose.keypoints[RIGHTSHOULDER].position.y,
                };

                //3点座標から角度を計算
                let RightHipAngle = (
                    Math.atan2(
                        I3.y - I1.y,
                        I3.x - I1.x
                    )
                    - Math.atan2(
                        I2.y - I1.y,
                        I2.x - I1.x
                    )
                ) * (180 / Math.PI);
                RightHipAngle = Math.abs(RightHipAngle);
                if (RightHipAngle > 180) {
                    RightHipAngle = Math.abs(RightHipAngle - 360);
                }

                //小数点切り捨て
                tRHA = Math.floor(RightHipAngle);

                // console.log(flexiontext2);

                //円を描画
                fill(0, 0, 0);
                ellipse(pose.keypoints[RIGHTHIP].position.x, pose.keypoints[RIGHTHIP].position.y, 15);

                //角度を描画
                fill(200, 200, 200);
                stroke(25);
                textSize(25);
                textFont('sans-serif');
                text(tRHA + "°", pose.keypoints[RIGHTHIP].position.x, pose.keypoints[RIGHTHIP].position.y);
            } 
            if (pose.keypoints[LEFTHIP].score > 0.6 && pose.keypoints[LEFTKNEE].score > 0.6 && pose.keypoints[LEFTSHOULDER].score > 0.6 && pose.score > 0.6) {
                //左腰の角度

                const U1 = {
                    x: pose.keypoints[LEFTHIP].position.x,
                    y: pose.keypoints[LEFTHIP].position.y,
                };
                const U2 = {
                    x: pose.keypoints[LEFTKNEE].position.x,
                    y: pose.keypoints[LEFTKNEE].position.y,
                };
                const U3 = {
                    x: pose.keypoints[LEFTSHOULDER].position.x,
                    y: pose.keypoints[LEFTSHOULDER].position.y,
                };

                //3点座標から角度を計算
                let LeftHipAngle = (
                    Math.atan2(
                        U3.y - U1.y,
                        U3.x - U1.x
                    )
                    - Math.atan2(
                        U2.y - U1.y,
                        U2.x - U1.x
                    )
                ) * (180 / Math.PI);
                LeftHipAngle = Math.abs(LeftHipAngle);
                if (LeftHipAngle > 180) {
                    LeftHipAngle = Math.abs(LeftHipAngle - 360);
                }

                //小数点切り捨て
                tLHA = Math.floor(LeftHipAngle);

                //円を描画
                fill(0, 0, 0);
                ellipse(pose.keypoints[LEFTHIP].position.x, pose.keypoints[LEFTHIP].position.y, 30);

                //角度を描画
                fill(255, 255, 255);
                stroke(30);
                textSize(30);
                textFont('sans-serif');
                text(tLHA + "°", pose.keypoints[LEFTHIP].position.x, pose.keypoints[LEFTHIP].position.y);
            }
            counter(tRKA, tLKA, tRHA, tLHA);
        }
    }
}


function counter(angle1, angle2, angle3, angle4) {

    usercount = document.form.count.value; //htmlから目標回数を取得
    // console.log(usercount);

    // console.log(angle1);
    // console.log(angle2);
    // console.log("右腰"+angle3);
    // console.log("左腰" + angle4);

    // if (angle1 < 95 && angle3 > 110 && rflag == false) { 
    //     //右側のフラグここから
    //     rflag = true;
    //     rcheck +=1;
    // } else if (angle1 > 165 && angle3 > 165 && rflag == true) {
    //     if (lflag = true) {
    //         count += 1; //r,lfagともにtrueならカウント+1
    //         lflag = false;
    //         rflag = false; 
    //         rcheck = 0;
    //     }
    //     //右側フラグここまで
    // } else if (angle2 < 95 && angle4 > 105 && lflag == false) {
    //     lflag = true;
    //     lcheck +=1;
    // } else if (angle2 > 165 && angle4 > 165 && lflag == true) {
    //     if (rflag = true) {
    //         count += 1; //r,lfagともにtrueならカウント+1
    //         lflag = false;
    //         rflag = false;
    //         lcheck = 0;
    //     }
    // }

    if ((angle1 < 95 && angle3 > 110 && rflag == false) || (angle2 < 95 && angle4 > 105 && rflag == false)){
        rflag = true;
    } else if ((angle1 > 165 && angle3 > 165 && rflag == true) || (angle2 > 165 && angle4 > 165 && lflag == true)){
        count += 1;
        rflag = false;
    }

        setTimeout(() => { //目標達成後の画面遷移フラグ(5秒後)
            // console.log("Execution 5sec");
            // console.log(nextpage);
            nextpage = true;
            // location.href = "result.html";
        }, 5000);
    }


