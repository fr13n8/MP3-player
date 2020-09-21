const transform = (el, what) => {
  el.style.mozTransform =
    el.style.msTransform =
    el.style.webkitTransform =
    el.style.transform = what;
};

const player = document.querySelector('#player');

const caretUp = document.querySelector('.fa-angle-up');
const caretDown = document.querySelector('.fa-angle-down');
const divDown = document.querySelector('.scrollDown');

const spring = new rebound.SpringSystem();

let animation = spring.createSpring(60, 5);

let scrollDown = spring.createSpring(70, 7);

const expand = (el, val) => {
  transform(el, `scale(${val},${val})`);
};

const down = (el, val) => {
  el.style.top = `-${val}%`;
};

animation.addListener({
  onSpringUpdate(spring) {
    let current = spring.getCurrentValue();
    let val = rebound.MathUtil.mapValueInRange(current, 0, 1, 0.5, 1);
    expand(player, val);
  }
});


scrollDown.addListener({
  onSpringUpdate(spring) {
    let current = spring.getCurrentValue();
    let val = rebound.MathUtil.mapValueInRange(current, 0, 1, 140, 30);
    down(divDown, val);
  }
});


caretDown.addEventListener('click', () => {
  scrollDown.setEndValue(1);
});

caretUp.addEventListener('click', () => {
  scrollDown.setEndValue(0);
});

document.addEventListener('DOMContentLoaded', () => {
  animation.setEndValue(1);
});

