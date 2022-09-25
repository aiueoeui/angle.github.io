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

function poseangle(keypoints) {
    inputs = [];

    deg = anglekeisan(
        keypoints, RIGHTHIP, RIGHTKNEE, RIGHTANKLE,
    );
    inputs.push(deg);

    return inputs;
}

function anglekeisan(keypoints, HIP, KNEE, ANKLE) {

    const P1 = {
        x: keypoints[HIP].position.x,
        y: keypoints[HIP].position.y,
    };
    const P2 = {
        x: KNEE.x,
        y: KNEE.y,
    };
    const P3 = {
        x: ANKLE.x,
        y: ANKLE.y,
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

    

    console.log(flexion);
}

function angledraw(flexion) {
    //小数点切り捨て
    let flexiontext = Math.floor(flexion);

    //円を描画
    fill(0, 0, 0);
    ellipse(pose.keypoints[RIGHTELBOW].position.x, pose.keypoints[RIGHTELBOW].position.y, 30);

    //角度を描画
    fill(255, 255, 255);
    stroke(30);
    textSize(30);
    textFont('sans-serif');
    text(flexiontext + "°", pose.keypoints[RIGHTELBOW].position.x, pose.keypoints[RIGHTELBOW].position.y);
}