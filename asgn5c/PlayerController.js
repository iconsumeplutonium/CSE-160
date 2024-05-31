import * as three from 'three';

export let keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    lshift: false
}

let direction = new three.Vector3();

export function setupController() {
    document.addEventListener('keydown', function(ev) {
             if (ev.keyCode == 87) keys.w      = true;
        else if (ev.keyCode == 83) keys.s      = true;
        else if (ev.keyCode == 65) keys.a      = true;
        else if (ev.keyCode == 68) keys.d      = true;
        else if (ev.keyCode == 32) keys.space  = true;
        else if (ev.keyCode == 16) keys.lshift = true;
    });

    document.addEventListener('keyup', function(ev) {
             if (ev.keyCode == 87) keys.w      = false;
        else if (ev.keyCode == 83) keys.s      = false;
        else if (ev.keyCode == 65) keys.a      = false;
        else if (ev.keyCode == 68) keys.d      = false;
        else if (ev.keyCode == 32) keys.space  = false;
        else if (ev.keyCode == 16) keys.lshift = false;
    });
}

let clock = new three.Clock();
export function movePlayer(controls) {
    const deltaTime = clock.getDelta();
    const speed = 1;

    direction.x = Number(keys.d) - Number(keys.a);
    direction.y = Number(keys.space) - Number(keys.lshift);
    direction.z = Number(keys.w) - Number(keys.s);
    direction.normalize();

    let velocity = new three.Vector3(0, 0, 0);

    if (keys.a || keys.d) 
        velocity.x -= direction.x * speed;
    if (keys.space || keys.lshift) 
        velocity.y -= direction.y * speed;
	if (keys.w || keys.s) 
        velocity.z -= direction.z * speed;


    controls.moveRight(velocity.x * deltaTime * -1);
    controls.getObject().position.y += velocity.y * deltaTime * -1;
	controls.moveForward(velocity.z * deltaTime * -1);

}