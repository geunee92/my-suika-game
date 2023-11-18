import { Engine, Render, Runner, World, Bodies, Body, Events, Collision} from "matter-js";
import { FRUITS } from "./fruits";

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F7F4C8",
    width: 620,
    height: 850,
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143"}
})

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143"}
})

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: "#E6B143"}
})

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#E6B143"}
})

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
// 과일을 내리고 있는 동안 액션을 막아주는 변수값
let disableAction = false;
let interval = null;
let isSuika = false;

// 과일을 추가해주는 함수
function addFruit() {
  const index = Math.floor(Math.random * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    // 바로 떨어지지 않고 위에 있게 해준다.
    isSleeping: true,
    // 이미지를 보여주게 해준다.
    render: {
      sprite: { texture: `${fruit.name}.png` }
    },
    restitution: 0.2,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body)
}

// 자바스크립트 키보드 인식 내장 메소드로 키 추가
window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }
  switch (event.code) {
    case "KeyA":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 30)
        Body.setPosition(currentBody, {
          x: currentBody.position.x - 1,
          y: currentBody.position.y,
        })
      }, 5);
      break; 
   
      
    case "KeyD":
      if (interval)
      return;

    interval = setInterval(() => {
      if (currentBody.position.x + currentFruit.radius < 590)
      Body.setPosition(currentBody, {
        x: currentBody.position.x + 1,
        y: currentBody.position.y,
      });
      }, 5);
      break;

    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000)

      break;
  }
}

window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null
  }
}

function resetWorld() {
  World.clear(world);


  World.add(world, [leftWall, rightWall, ground, topLine]);

  currentBody = null;
  currentFruit = null;
  disableAction = false;
  isSuika = false;

  addFruit();
}

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index === collision.bodyB.index){
      const index = collision.bodyA.index;

      if (index === FRUITS.length -1) {
        return;
      }

      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1];
      
      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite: { texture: `${newFruit.name}.png` }
          },
          index: index + 1,
        }
      );

      World.add(world, newBody)

      setTimeout(() => {
        if (newBody.index === 10) {
          isSuika = true;
        }
      }, 500)

    }

    if ( isSuika ) {
      const userConfirmed = confirm("수박을 완성했어요! 이제 일하세요!");

      if (userConfirmed) {
        resetWorld();
      }
    }

    if (
      !disableAction &&
      (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")
    ) {
      const userConfirmed = confirm("게임 오버ㅜㅜ 다시 하려면 확인 버튼을 누르세요.");

      if (userConfirmed) {
        resetWorld();
      }
    }

  })
})

addFruit();