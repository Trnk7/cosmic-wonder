function main() {
  const canvas = document.createElement("canvas");
  canvas.style.zIndex = "1000";
  canvas.style.position = "fixed";
  canvas.style.cursor= "none";
  canvas.style.top = "0";
  canvas.style.left = "0";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let mouseX = canvas.width / 2;
  let mouseY = canvas.height / 2;

  const fly = new Image();
  fly.src = "fly.png";
  
  let score =0;
  let s = 0;
  class Spider {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.ds = 1;
      this.rotation = 0;
      this.speed = 3;
      this.bodyWidth = 30;
      this.bodyHeight = 40;
      this.legs = [];
      this.reached = false;

      const legAngles = [
        { side: 1, baseAngle: -3.0, group: 0 },  // left back
        { side: 1, baseAngle: -2.6, group: 1 },  // left mid back
        { side: 1, baseAngle: -0.9, group: 0 },   // left mid front
        { side: 1, baseAngle: -0.5, group: 1 },   // left front
        { side: -1, baseAngle: -3.0, group: 1 }, // right -back
        { side: -1, baseAngle: -2.6, group: 0 }, // right mid back
        { side: -1, baseAngle: -0.9, group: 1 },  // Mid-back left
        { side: -1, baseAngle: -0.5, group: 0 }   // Back left
      ];

      for (let i = 0; i < legAngles.length; i++) {
        this.legs.push({
          side: legAngles[i].side,
          baseAngle: legAngles[i].baseAngle,
          angle: legAngles[i].baseAngle,
          length1: 30,
          length2: 20,
          group: legAngles[i].group, 
          isLifted: false,
          stepProgress: 0,
          targetX: 0,
          targetY: 0,
          currentX: 0,
          currentY: 0
        });
      }
      this.stepDuration = 15; 
      this.stepCounter = 0;
      this.currentGroup = 0;
    }

    update() {
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 50) {
        this.rotation = Math.atan2(dy, dx);
        const moveX = Math.cos(this.rotation) * this.speed;
        const moveY = Math.sin(this.rotation) * this.speed;
        // // this.x += moveX;
        // // this.y += moveY;

        this.stepCounter++;


        if (this.stepCounter >= this.stepDuration) {
          this.stepCounter = 0;
          this.currentGroup = 1 - this.currentGroup; 
        }

        this.legs.forEach((leg, i) => {
          if (leg.group === this.currentGroup) {
            // This leg is moving
            leg.stepProgress = ((this.stepCounter + 5) / this.stepDuration);

            if (this.stepCounter === 0) {
              // Start new step - set target position
              const reach = 20;
              leg.targetX = reach * Math.cos(leg.baseAngle);
              leg.targetY = reach * Math.sin(leg.baseAngle) * leg.side;
            }

            // Lift and move leg forward
            const progress = leg.stepProgress;

            if (progress < 0.5) {
              // Lifting phase
              leg.isLifted = true;
              const liftAmount = Math.sin(progress * Math.PI * 2) * 2;
              leg.currentX = leg.targetX * progress * 2;
              leg.currentY = leg.targetY * progress * 2;
              leg.liftHeight = liftAmount;
            } else {
              // Lowering phase
              const landProgress = (progress - 0.5) * 2;
              leg.isLifted = false;
              leg.currentX = leg.targetX * (0.5 + landProgress * 0.5) * 2;
              leg.currentY = leg.targetY * (0.5 + landProgress * 0.5) * 2;
              leg.liftHeight = Math.sin((1 - landProgress) * Math.PI) * 8;
            }
          } else {
            leg.isLifted = false;
            leg.liftHeight = 0;
            this.x += (moveX / 8);
            this.y += (moveY / 8);

            leg.currentX -= moveX * 0.9;
            leg.currentY -= moveY * 0.9;

            const dist = Math.sqrt(leg.currentX * leg.currentX + leg.currentY * leg.currentY);
            const maxDist = 40;
            if (dist > maxDist) {
              leg.currentX = (leg.currentX / dist) * maxDist;
              leg.currentY = (leg.currentY / dist) * maxDist;
            }
          }
        });
      } else {
        this.legs.forEach(leg => {
          leg.isLifted = false;
          leg.liftHeight = 0;
          const restX = 30 * Math.cos(leg.baseAngle);
          const restY = 30 * Math.sin(leg.baseAngle) * leg.side;
          leg.currentX += (restX - leg.currentX) * 0.1;
          leg.currentY += (restY - leg.currentY) * 0.1;
        });
         
        if (distance < 50) {
          setTimeout(() => {
            this.reachUpd()
            this.reached = true;
          }, 300);
          let pop=()=>{

          }
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(this.rotation);
          ctx.fillStyle = "rgba(255,0,0,0.8)";
          ctx.font = "30px Arial";
          ctx.fillText("❤️", 0, -20);
          ctx.restore();
        }

      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      this.legs.forEach(leg => this.drawLeg(leg, leg.side));

      // Draw body
      // ctx.drawImage(spd,-25,-15,70,30)
      ctx.fillStyle = "#140000ff";
      ctx.beginPath();
      ctx.ellipse(2, 0, 28, 7, 0, 0, Math.PI * 2)
      ctx.ellipse(-5, 0, 18, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = "#100000ff";
      ctx.ellipse(10, 0, 15, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(22, 0, 8, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(26, -3, 2, 0, Math.PI * 2);
      ctx.arc(26, 3, 2, 0, Math.PI * 2);
      ctx.arc(24, -5, 1.5, 0, Math.PI * 2);
      ctx.arc(24, 5, 1.5, 0, Math.PI * 2);
      ctx.fill();


      ctx.restore();
    }

    drawLeg(leg, side) {
      ctx.save();

      
      const legIndex = this.legs.filter(l => l.side === side).indexOf(leg);
      
      const attachPoints = [-1, 2, 7, 10]; 
      const attachX = attachPoints[legIndex];
      const attachY = -side * 10; 

      
      const targetX = leg.currentX;
      const targetY = leg.currentY;

     
      const dx = targetX;
      const dy = targetY - (leg.liftHeight || 0);
      const distance = Math.sqrt(dx * dx + dy * dy);
      const totalLength = leg.length1 + leg.length2;

      const clampedDist = Math.min(distance, totalLength * 0.95);

      const angleToTarget = Math.atan2(dy, dx);
      
      const cosUpperAngle = (leg.length1 * leg.length1 + clampedDist * clampedDist - leg.length2 * leg.length2) / (2 * leg.length1 * clampedDist);
      const upperAngleOffset = Math.acos(Math.max(-1, Math.min(1, cosUpperAngle)));

      const angle1 = (leg.baseAngle > -1) ? angleToTarget - upperAngleOffset * side : angleToTarget + upperAngleOffset * side;

      const midX = attachX + leg.length1 * Math.cos(angle1);
      const midY = attachY + leg.length1 * Math.sin(angle1);

      // End position
      const endX = attachX + targetX;
      const endY = attachY + targetY - (leg.liftHeight || 0);

      // Draw leg
      ctx.strokeStyle = "#000000ff";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";

      // Upper leg segment
      ctx.beginPath();
      ctx.moveTo(attachX, attachY);
      ctx.lineTo(midX, midY);
      ctx.stroke();

      // Lower leg segment
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.restore();
    }
    reachUpd(){
      score++;
      
      if(Math.ceil(score/20)!==s){
        document.getElementById("score").innerText +='s';
        s = Math.ceil(score/20)
      }

    }
  }

  let spiders = [new Spider(Math.random() * canvas.width, Math.random() * canvas.height)];

  canvas.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
  });
  function closestSpider() {
    let closest = null;
    let minDist = Infinity;
    spiders.forEach(s => {
      const dx = mouseX - s.x;
      const dy = mouseY - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closest = s;
      }
    });
    return closest;
  }
  function drawfly() {
    let s = closestSpider();
    ctx.save();
    ctx.translate(mouseX, mouseY);
    ctx.rotate(s.rotation-Math.PI/2);
    ctx.drawImage(fly,- 35,- 35, 70, 70)
    
    ctx.restore();
  }
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  let frameCount = 0;
  function animate() {
    frameCount++;
    ctx.fillStyle = "rgba(30, 30, 30, 1)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawfly();
    spiders.forEach(s => {
      s.draw();
      s.update();

    })
    
    spiders = spiders.filter(s => s.reached === false);
    if(spiders.length === 0) {
      spiders.push(new Spider(Math.random()*canvas.width, Math.random()*canvas.height));
    }
    if(frameCount % 100=== 0&& spiders.length<4){
      spiders.push(new Spider(Math.random()*canvas.width, Math.random()*canvas.height));
    }
    requestAnimationFrame(animate);
  }

  animate();
  document.getElementById("score").innerText = 'One click. Infinite Spiders';
}
// main()