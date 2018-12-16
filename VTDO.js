//static objects

Array.prototype.contains = function(obj) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
}
String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function times(a, obj) {
	var arr = [];
	for (var i = 0; i < a.length; i++) {
		arr.push(a[i] * obj);
	}
	return arr;
}

function fix(angle) {
	angle %= 360;
	if (angle < 0)
		angle += 360;
	return angle;
}

function getAngle(p1, p2) {
	if (p1.length != 2 || p2.length != 2)
		return -1;
	return fix(Math.atan2(p1[1] - p2[1], p1[0] - p2[0]) * 180 / Math.PI - 90);
}

var canvas = document.getElementById("VTDO");
var ctx = canvas.getContext("2d");

var dimension = [ canvas.width, canvas.height ];
var images = [];

var updateSpeed = 1000 / 60;
var tileSize = 32;

var gameOver = false;
var pauzed = false;
var shown = true;

// Map and other static things
var resources = [ 20, 0, 30, 30, 150, 0, 1 ];
// var resources = [2000,0,30,30000000,30000000,30000000,1];
var logos = [ "Osomi", "Osomi_Lunar", "Omikron" ];
var gui = [ "Shop_Background", "Shop_Slot", "Shopup", "ShopUnknown",
		"ShopAttack", "ShopDefense", "ShopSpecial", "ShopTemporary", "ShopLens" ];
var resource = [ "Heart", "Energy", "Plasma", "Steel", "Coins", "Atoms",
		"Level" ];
var tiles = [ "Tile", "PathSLR", "PathSLR", "PathSUD", "PathSUD", "PathCUR",
		"PathCUL", "PathCLD", "PathCRD", "PathCUR", "PathCUL", "PathCLD",
		"PathCRD", "PathBU", "PathBR", "PathBD", "PathBL" ];
var tilesOverlay = [ "Turret1", "Turret1Top", "TurretUpgr1", "TurretUpgr1Top",
		"RapidTurret1", "RapidTurret1Top", "IntelligentTurret1",
		"IntelligentTurret1Top", "VelocityTurret1", "VelocityTurret1Top",
		"SolarPanel", "SolarPanel", "SolarPanel", "SolarPanel", "SolarPanel",
		"SolarPanel", "SolarPanel", "SolarPanel", "SolarPanel", "SolarPanel",
		"SolarPanel", "SolarPanel", "SolarPanel", "SolarPanel",
		"Plasma_collector", "Plasma_collector", "Plasma_portal",
		"Plasma_portal", "Plasma_machine", "Plasma_machine", "Beamer1",
		"Beamer1", "Beamer1", "Beamer1", "Beamer1", "Beamer1", "Beamer1",
		"Beamer1", "Beamer1", "Beamer1", "Beamer1", "Beamer1", "Beamer1",
		"Beamer1", "Beamer1", "Beamer1" ];
var projectile = [ "Bullet" ];
var entity = [ "RobotRunner", "Player" ];

// Intro Text:

// Omikron: Your crystal cores are mine!
// YOU: You will never get my crystal cores!
// ???: Omikron is starting an attack, get ready to defend!
// Tutorial: To fight off Omikron's attack, you will need turrets!
// Tutorial: But first you'll need a source of energy, place down a solar panel.
// Tutorial: You can upgrade turrets to increase their speed, range and attack
// speed.
// Tutorial: If you ever get in trouble, use your character to attack bots.
// YOU: Bring it on Omikron!
// Tutorial: Omikron will try to get your crystal cores, which he gets when one
// of his bots pass through the portal.
// Tutorial: If you lose all of your crystal cores, game over.

// TODO: Bridges, upgrades!

var sLogos = 0;
var sGui = sLogos + logos.length;
var sResource = sGui + gui.length;
var sTile = sResource + resource.length;
var sOverlay = sTile + tiles.length;
var sProj = sOverlay + tilesOverlay.length;
var sEnt = sProj + projectile.length;

var mapLength = dimension[0] / tileSize + 1, mapHeight = dimension[1]
		/ tileSize + 1 - 128 / tileSize;
var map = [];
var overlayMap = [];

var entities = [];
var projectiles = [];
var player = null;

var shop = new Shop();

var tick = 1;

var started = false;

var dev = true;
var cmd = dev ? "007FFFFFFFF" : "";

addImages(logos);
addImages(gui);
addImages(resource);
addImages(tiles);
addImages(tilesOverlay);
addImages(projectile);
addImages(entity);

// Main functions

window.onfocus = function() {
	shown = true;
};

window.onblur = function() {
	shown = false;
};
var waitTicks = 500;
function main() {
	if (!started) {
		init();
		started = true;
	}
	draw();
	if (waitTicks > 0)
		waitTicks--;
	if (!pauzed && shown && waitTicks == 0) {
		for (var i = 0; i < tick; i++)
			update();
	}
}
setInterval("main()", updateSpeed);
var music = null;
function init() {
	for (var j = 0; j < mapHeight; j++) {
		var ar = [];
		var arr = [];
		for (var i = 0; i < mapLength; i++) {
			ar.push(0);
			arr.push(null);
		}
		map.push(ar);
		overlayMap.push(arr);
	}
	path([ [ 0, 2 ], [ 11, 2 ], [ 11, 5 ], [ 15, 5 ], [ 15, 2 ], [ 17, 2 ],
			[ 17, 10 ], [ 11, 10 ], [ 11, 18 ], [ 28, 18 ], [ 28, 10 ],
			[ 22, 10 ], [ 22, 2 ], [ 24, 2 ], [ 24, 5 ], [ 28, 5 ], [ 28, 2 ],
			[ 39, 2 ] ]);
	path([ [ 0, 8 ], [ 11, 8 ], [ 11, 5 ] ]);
	path([ [ 39, 8 ], [ 28, 8 ], [ 28, 2 ] ]);

	player = new Player();

	// Temp objects, like turrets for testing, entities etc.
	// entities.push(new RobotRunner(tileSize*0,tileSize*2,500,1.8,100));
	// entities.push(new RobotRunner(tileSize*2,tileSize*2,500,1.8,50));
	// entities.push(new RobotRunner(tileSize*4,tileSize*2,500,1.8,20));
	// entities.push(new RobotRunner(tileSize*6,tileSize*2,500,1.8,10));
	// entities.push(new RobotRunner(tileSize*1,tileSize*2,500,1.8));
	// entities.push(new RobotRunner(tileSize*2,tileSize*2,500,1.8));
	// entities.push(new RobotRunner(tileSize*3,tileSize*2,500,1.8));

	// overlayMap[5][23] = new Turret(23,5,0,1);
	// overlayMap[3][10] = new Turret(10,3,0,1);
	// overlayMap[5][10] = new Turret(10,5,0,1);
	// overlayMap[5][16] = new Turret(16,5,0,1);

	// overlayMap[5][3] = new LaserTurret(5, 3, 0, 9, 1, 10, 3, 10);
	// overlayMap[5][4] = new LaserTurret(5, 4, 0, 9, 1, 10, 1, 10);
	// overlayMap[5][5] = new LaserTurret(5, 5, 0, 9, 1, 10, 2, 10);
	// overlayMap[5][6] = new LaserTurret(5, 6, 0, 9, 1, 10, 4, 10);
	// overlayMap[3][4] = new PowerSource(4, 3, 10, 1);
	// overlayMap[3][6] = new PowerSource(6, 3, 10, 1);

	ctx.font = "20px Georgia";

	music = new Audio('Omikron\'s minions.mp3');
	music.volume = 0.075;
	music.loop = true;

	music.play();

	for (var i = 0; i < 10 * 10; i++)
		kills.push(Math.floor(Math.pow(i, 1.25) + Math.sqrt(i) + 5));
	toSpawn = kills[0];

}
function draw() {
	rect(0, 0, dimension[0], dimension[1], "#FFFFFF");
	for (var i = 0; i < mapLength; i++)
		for (var j = 0; j < mapHeight; j++) {
			var img = images[map[j][i] + sTile];
			ctx.drawImage(img, i * tileSize, j * tileSize);
		}
	for (var i = 0; i < mapLength; i++)
		for (var j = 0; j < mapHeight; j++)
			if (overlayMap[j][i] != null)
				overlayMap[j][i].draw();
	for (var i = 0; i < entities.length; i++)
		entities[i].draw();
	player.draw();
	for (var i = 0; i < projectiles.length; i++)
		projectiles[i].draw();
	for (var i = 1; i < player.path.length; i++) {
		ctx.beginPath();
		ctx.moveTo(player.path[i][0] * tileSize + tileSize / 2,
				player.path[i][1] * tileSize + tileSize / 2);
		ctx.lineTo(player.path[i - 1][0] * tileSize + tileSize / 2,
				player.path[i - 1][1] * tileSize + tileSize / 2);
		ctx.stroke();
	}
	shop.draw();
	if (gameOver) {
		ctx.fillStyle = '#FF0000';
		ctx.fillText("Game over!", dimension[0] / 2 - "Game over!".length,
				dimension[1] / 2);
	}
	if (waitTicks > 0 && waitTicks < 100) {
		ctx.drawImage(images[2], dimension[0] / 2 - images[2].width / 2,
				dimension[2] / 2 - images[2].height / 2);
	} else if (waitTicks > 100 && waitTicks < 250) {
		var x = dimension[0] / 2 - images[1].width / 2;
		var y = dimension[2] / 2 - images[1].height / 2;
		ctx.drawImage(images[1], x, y);
	} else if (waitTicks > 250) {
		var x = dimension[0] / 2 - images[0].width / 2;
		var y = dimension[1] / 2 - images[0].height / 2;
		ctx.drawImage(images[0], x, y);
	}
}
var prevPow = 0, currPow = 0;
var updateT = 60;
var kill = 0;
var kills = [];
var horde = 0;
var toSpawn = -1;
var spawnInterval = 0;
function update() {
	if (gameOver)
		return;
	resources[1] = 0;
	var pwr = 0, curr = 0;
	if (updateT > 0)
		updateT--;
	for (var i = 0; i < mapLength; i++)
		for (var j = 0; j < mapHeight; j++) {
			if (overlayMap[j][i] != null) {
				if (overlayMap[j][i].takesPower) {
					pwr += overlayMap[j][i].power;
					curr += overlayMap[j][i].power;
					if (curr <= resources[1]) {
						if (!overlayMap[j][i].update())
							curr -= overlayMap[j][i].power;
					} else
						curr -= overlayMap[j][i].power;
				} else {
					if (updateT == 0)
						overlayMap[j][i].update();
					resources[1] += overlayMap[j][i].power;
				}
			}
		}
	prevPow = pwr;
	currPow = curr;
	player.update();
	for (var i = 0; i < entities.length; i++)
		entities[i].update();
	for (var i = 0; i < projectiles.length; i++)
		projectiles[i].update();
	if (updateT == 0)
		updateT = 60;
	var arr = [];
	if (kill >= kills[(resources[6] - 1) * 10 + horde]) {
		kill -= kills[(resources[6] - 1) * 10 + horde];
		horde++;
		if (horde >= 10) {
			horde = 0;
			resources[6]++;
		}
		toSpawn = kills[(resources[6] - 1) * 10 + horde];
	}
	if (toSpawn > 0) {
		if (spawnInterval > 0)
			spawnInterval--;
		else {
			var max = ((Math.pow(resources[6], 2.5) * 10 + Math.pow(horde, 1.5) * 5) * 1.5 + 40) / 4 * 3;
			player.dmg = max / 5;
			var money = Math.pow((resources[6] - 1) + horde * 0.1, 1.2) + 5;
			var ent = new RobotRunner(0, 2 * tileSize, max, 0.2 + Math
					.sqrt(resources[6]), money);
			getRandom(ent);
			ent.seek();
			entities.push(ent);
			spawnInterval = 30 + 30 - ((resources[6] - 1) * 10 + horde) / 30;
			toSpawn--;
		}
	}
}

canvas.addEventListener("mousedown", click, false);
function click(e) {
	if (gameOver || !shown || waitTicks > 0)
		return;
	var rect = canvas.getBoundingClientRect();
	var pos = [ e.clientX - rect.left, e.clientY - rect.top ];
	if (e.button == 1) {
		if (pos[1] >= mapHeight * tileSize) {
			shop.clear();
			return;
		}
		if (player.path.length == 0)
			player.path = getPath([ player.x + tileSize / 2,
					player.y + tileSize / 2 ], [ pos[0], pos[1] ], tileSize,
					tileSize, tileSize, tileSize, true);
		return;
	}
	if (shop.click(pos[0], pos[1]))
		return;
	if (shop.canPlace(Math.floor(pos[0] / tileSize), Math.floor(pos[1]
			/ tileSize))
			|| shop.itemSelected != -1)
		return;
	if (player.path.length == 0)
		player.path = getPath([ player.x, player.y ], [ pos[0], pos[1] ],
				tileSize, tileSize, tileSize, tileSize, true);
}

document.addEventListener("keydown", type, false);

String.prototype.beginsWith = function(string) {
	if (string.length > this.length)
		return false;
	return this.substring(0, string.length) == string;
};

function type(e) {
	if (!dev)
		return;
	if (e.keyCode != 189 && e.keyCode != 13
			&& (e.keyCode < 48 || e.keyCode > 57)
			&& !(e.keyCode >= 65 && e.keyCode <= 70))
		return;
	if (cmd.length < 82 && e.keyCode != 189 && e.keyCode != 13)
		cmd += String.fromCharCode(e.keyCode);
	else if (e.keyCode == 189 && cmd.length > 0)
		cmd = cmd.substring(0, cmd.length - 1);
	else if (e.keyCode == 13) {
		if (cmd.beginsWith("00")) { // give
			cmd = cmd.substring(2);
			if (cmd.length == 9) {
				c = cmd;
				cmd = cmd.substring(1);
				var num = parseInt(cmd, 16);
				if (c.beginsWith("0"))
					resources[0] += num;
				else if (c.beginsWith("1"))
					resources[2] += num;
				else if (c.beginsWith("2"))
					resources[3] += num;
				else if (c.beginsWith("3"))
					resources[4] += num;
				else if (c.beginsWith("4"))
					resources[5] += num;
				else if (c.beginsWith("5")) {
					var i = 0;
					if (num + resources[6] - 1 > 10)
						num = 10 - (resources[6] - 1);
					while (i < num * 10) {
						kill += kills[(resources[6] - 1) * 10 + horde + i];
						i++;
					}
				} else if (c.beginsWith("6")) {
					var i = 0;
					if (num + horde + 10 * (resources[6] - 1) > 100)
						num = 100 - (horde + 10 * (resources[6] - 1));
					while (i < num) {
						kill += kills[(resources[6] - 1) * 10 + horde + i];
						i++;
					}
				} else if (c.beginsWith("7")) {
					for (var i = 0; i < 6; i++)
						if (i != 1)
							resources[i] += num;
				} else
					console.log("Invalid number!");
			} else
				console.log("Invalid length!");
		} else if (cmd.beginsWith("01")) { // clear/kill
			cmd = cmd.substring(2);
			if (cmd.length == 2) { // entity
				var num = parseInt(cmd, 16);
				if (num == 0) { // all
					for (var i = entities.length - 1; i >= 0; i--) {
						if (entities[i] != player) {
							entities[i].damage(entities[i].health);
						}
					}
				} else if (num == 255) { // all + projectiles
					for (var i = entities.length - 1; i >= 0; i--) {
						if (entities[i] != player) {
							entities[i].damage(entities[i].health);
						}
					}
					for (var i = projectiles.length - 1; i >= 0; i--) {
						if (projectiles[i] != player) {
							projectiles[i].remove();
						}
					}
				}
			} else if (cmd.length == 0) { // field
				for (var i = 0; i < mapLength; i++)
					for (var j = 0; j < mapHeight; j++)
						overlayMap[j][i] = null;
			} else
				console.log("Invalid argument!");
		} else if (cmd.beginsWith("02")) { // setSpeed
			cmd = cmd.substring(2);
			if (cmd.length == 1) // tick
				tick = parseInt(cmd, 16);
			else
				console.log("Invalid argument!");
		} else if (cmd.beginsWith("03")) { // dev mode
			cmd = cmd.substring(2);
			if (cmd.length == 0) // tick
				dev = false;
			else
				console.log("Invalid argument!");
		} else
			console.log("Invalid type!");
		cmd = "";
	}
}

canvas.addEventListener("mousemove", move, false);
function move(e) {
	var rect = canvas.getBoundingClientRect();
	var pos = [ e.clientX - rect.left, e.clientY - rect.top ];
	mX = pos[0];
	mY = pos[1];
}
// Life helper
function removeLife() {
	if (resources[0] > 1)
		resources[0]--;
	else {
		resources[0] = 0;
		gameOver = true;
	}
}
// Audio
function play(file, amp) {
	var audio = new Audio(file + '.mp3');
	audio.volume = 0.04 * amp;
	audio.play();
}
// Directions
function getNDir(i) {
	if (i == 9 || i == 11 || i == 1)
		return 1;
	else if (i == 10 || i == 12 || i == 2)
		return 2;
	else if (i == 5 || i == 6 || i == 4)
		return 4;
	else if (i == 7 || i == 8 || i == 3)
		return 3;
	return 0;
}
// Value
function val(i) {
	i %= 360;
	if (i < 0)
		i += 360;
	return i;
}
// Images
function addImages(paths) {
	for (var i = 0; i < paths.length; i++)
		addImg(paths[i]);
}
function addImg(path) {
	images.push(new Image());
	images[images.length - 1].src = path + ".png";
}

// Shortcut drawing
function rect(x, y, width, height, color) {
	ctx.beginPath();
	ctx.rect(0, 0, width, height);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.closePath();
}
function drawRect(x, y, width, height, color) {
	ctx.beginPath();
	ctx.rect(0, 0, width, height);
	ctx.fillStyle = color;
	ctx.stroke();
	ctx.closePath();
}
function clrRect(x, y, width, height, color) {
	ctx.beginPath();
	ctx.clrRect(0, 0, width, height);
	ctx.closePath();
}

// Thing

function transform(sourc) {
	// 9 things
	// 984 747 498
	var after = '';
	if (sourc > 100 && sourc < 100000) {
		sourc /= 1000.0;
		after = 'k';
	} else if (sourc > 100000 && sourc < 100000000) {
		sourc /= 1000000.0;
		after = 'm';
	} else if (sourc > 100000000) {
		sourc /= 1000000000.0;
		after = 'b';
	}
	var int = Math.floor(sourc);
	var left = sourc - int;
	var second = Math.floor(left * 10);
	var result = second == 0 || int >= 10 ? int + '' : int + '.' + second;
	return result + after;
}

// MapHelper

function set(x, y, i) {
	map[y][x] = i;
}
function get(x, y) {
	return map[y][x];
}
var mx = 0, my = 0;
// Shop helper
function Shop() {
	this.selected = [ 3, 1, 0 ];
	// Name,array (Which keeps going until arg[1].constructor!=Array)
	// Name,resource[0],resource[1],resource[2],resource[3],resource[4],resource[5]
	// Name,heart,power,plasma,steel,coins,atoms,wave
	this.slots = [
			"Shop",
			[ "Energy", [ "Unstable solar panel", 0, 0, 0, 5, 50, 0, 1, 5 ],
					[ "Stable solar panel", 0, 0, 0, 11, 180, 0, 1 ],
					[ "Unstable generator", 0, 0, 0, 20, 500, 0, 2 ],
					[ "Stable generator", 0, 0, 0, 50, 1000, 0, 3 ],
					[ "Nuclear reactor", 0, 0, 0, 100, 2500, 0, 5 ],
					[ "Power plant", 0, 0, 0, 200, 5000, 0, 7 ],
					[ "Nuclear power plant", 0, 0, 0, 500, 15000, 0, 10 ] ],
			[ "Plasma", [ "Plasma harverster", 0, 10, 0, 31, 75, 0, 1, 12 ],
					[ "Plasma rift", 0, 25, 0, 100, 3000, 0, 5 ],
					[ "Plasma machine", 0, 50, 0, 250, 10000, 0, 10 ] ],
			[ "Steel", [ "Drill", 0, 5, 0, 10, 180, 0, 1, 15 ],
					[ "Mine", 0, 15, 0, 25, 2750, 0, 5 ],
					[ "Quarry", 0, 40, 0, 300, 15000, 0, 10 ] ],
			[
					"Attack",
					[
							"Energy",
							[
									"Lasers",
									[ "Low energy laser", 0, 10, 0, 30, 200, 0,
											1, 18 ],
									[ "High energy laser", 0, 30, 0, 20, 500,
											0, 3 ],
									[ "Rapid laser", 0, 25, 0, 50, 1000, 0, 5 ],
									[ "Intelligent laser", 0, 20, 0, 100, 5000,
											0, 7 ],
									[ "Shockwave laser", 0, 50, 0, 250, 25000,
											0, 10 ] ],
							[
									"Tasers",
									[ "High energy taser", 0, 30, 0, 10, 500,
											0, 3, 23 ],
									[ "Low energy taser", 0, 70, 0, 20, 1500,
											0, 5 ],
									[ "Rapid taser", 0, 100, 0, 30, 5000, 0, 7 ],
									[ "Intelligent taser", 0, 90, 0, 50, 10000,
											0, 9 ],
									[ "Shockwave taser", 0, 110, 0, 90, 25000,
											0, 10 ] ],
							[
									"Magnetic fields",
									[ "Low range magnetic field", 0, 80, 0, 50,
											10000, 0, 9, 28 ],
									[ "High range magnetic field", 0, 180, 0,
											150, 50000, 0, 10 ] ] ],
					[
							"Plasma",
							[
									"Turrets",
									[ "Low power turret", 0, 5, 20, 15, 100, 0,
											1, 0 ],
									[ "High power turret", 0, 25, 50, 60, 700,
											0, 2 ],
									[ "Rapid turret", 0, 250, 300, 480, 4900,
											0, 4 ],
									[ "Intelligent turret", 0, 1750, 1125,
											1920, 19600, 0, 7 ],
									[ "High velocity turret", 0, 5250, 5625,
											11520, 68600, 0, 10 ] ],
							[
									"Waves",
									[ "Shockwave", 0, 10, 50, 30, 500, 0, 3, 30 ],
									[ "Low energy wave", 0, 15, 70, 20, 1000,
											0, 4 ],
									[ "High energy wave", 0, 30, 50, 40, 2500,
											0, 5 ],
									[ "Rapid wave", 0, 25, 80, 80, 10000, 8 ] ] ],
					[
							"Temporary",
							[
									"Bombs",
									[ "High energy bomb", 0, 40, 0, 5, 1500, 0,
											3, 34 ],
									[ "Low energy bomb", 0, 10, 0, 8, 500, 0, 2 ],
									[ "Repeating bomb", 0, 30, 0, 15, 5000, 0,
											5 ] ],
							[
									"Mines",
									[ "High energy mine", 0, 30, 50, 10, 10000,
											0, 10, 37 ],
									[ "Low energy mine", 0, 15, 30, 15, 7500,
											0, 8 ] ],
							[
									"Energizers",
									[ "High energy energizer", 0, 50, 0, 25,
											7500, 0, 7, 39 ],
									[ "Low energy energizer", 0, 30, 0, 30,
											5000, 0, 5 ] ],
							[
									"High resource turrets",
									[ "High damage turret", 0, 0, 0, 0, 5000,
											3, 8, 41 ],
									[ "Rapid fire turret", 0, 0, 0, 0, 3000, 1,
											5 ],
									[ "Exploding bullet turret", 0, 0, 0, 0,
											10000, 5, 10 ] ] ] ],
			[
					"Defense",
					[
							"Barricades",
							[ "Strong barricade", 0, 0, 0, 50, 1000, 0, 1, 44 ],
							[ "Electrifying fence", 0, 5, 0, 100, 5000, 0, 3 ] ],
					[ "Bots", [ "Strong bot", 1, 3, 0, 5, 2500, 0, 3, 46 ],
							[ "Intelligent bot", 1, 9, 0, 4, 5000, 0, 5 ],
							[ "Tank bot", 2, 15, 0, 10, 25000, 0, 10 ] ] ],
			[ "Special", [ "Portal cores", 0, 0, 0, 0, 7500, 1, 1, 49 ] ] ];
	this.upgr = [
			[ "Lens", [ "Focused", 0 ], [ "Wide", 0 ], [ "Reflecting", 0 ],
					[ "Mirrored", 0 ] ],
			[ "Bullets", [ "Area", 0 ], [ "Homing", 0 ], [ "Splitting", 0 ],
					[ "Bouncing", 0 ] ] ];
	this.itemSelected = -1;
	this.isFirst = true;
	this.slot = [];
	this.blockX = this.blockY = -1;
	this.hasBlock = false;
	this.selectedSlot = -1;
	this.hasSlot = false;
}
Shop.prototype.calculateRoute = function() {
	this.currArr = [];
	this.where = "";
	for (var i = 0; i < this.selected.length; i++) {
		this.where += (this.where == "" ? "" : " - ")
				+ (i == 0 ? this.slots[0] + " - "
						+ this.slots[this.selected[i] + 1][0]
						: this.currArr[this.selected[i] + 1][0]);
		this.currArr = (i == 0 ? this.slots[this.selected[i] + 1]
				: this.currArr[this.selected[i] + 1]);
	}
	this.isRoot = false;
	if (this.currArr.length == 0) {
		this.currArr = this.slots;
		this.isRoot = true;
		this.where = "Shop";
	}
	this.size = mapLength * tileSize / 16;
	this.size2 = (dimension[1] - (mapHeight * tileSize - 1) - tileSize) / 2;
};
Shop.prototype.clear = function() {
	this.itemSelected = -1;
};
Shop.prototype.draw = function() {
	if (this.isFirst) {
		this.isFirst = false;
		this.calculateRoute();
	}
	var backup = ctx.font;
	if (dev) {
		ctx.fillStyle = "#F4F4F4";
		ctx
				.fillRect(0, mapHeight * tileSize - 2 - 32,
						dimension[0] / 5 * 4, 32);
		ctx.fillStyle = "#33302E";
		var old = ctx.lineWidth;
		ctx.lineWidth = 4;
		ctx.strokeRect(0, mapHeight * tileSize - 2 - 32, dimension[0] / 5 * 4,
				32);
		ctx.lineWidth = old;
		ctx.fillStyle = "#33302E";
		ctx.fillText("#" + cmd, 5, mapHeight * tileSize + 4 - 16);
		ctx.fillStyle = "#000000";
	}
	ctx.fillStyle = '#000000';
	ctx.font = "10px Georgia";
	ctx.drawImage(images[sGui + 2], (mapLength - 1) * tileSize
			- (mapLength - 1) * tileSize / 5, mapHeight / 2 * tileSize
			- tileSize);
	if (this.hasBlock || this.itemSelected != -1) {
		// Draw it the way you would if it has a block or an item selected!
	}
	ctx.drawImage(images[sGui], 0, mapHeight * tileSize - 2);
	ctx.fillStyle = '#FFFFFF';
	ctx.fillText(this.where, mapLength * tileSize / 2 - this.where.length,
			mapHeight * tileSize - 1 + this.size2 - tileSize * 3 / 8);
	var first = this.slot.length == 0;
	if (!this.isRoot)
		this.drawSlot("Back", 1, this.size, this.size2, [], false, 0, first);
	for (var i = 1; i < this.currArr.length; i++) {
		var name = this.currArr[i][0];
		this.drawSlot(name, i + 1, this.size, this.size2, this.currArr[i],
				true, this.currArr[1][8] + i - 1, first);
	}
	for (var i = 0; i < resources.length; i++) {
		ctx.drawImage(images[sResource + i], 0, 0, 32, 32, dimension[0] - 32
				* resources.length + i * 32, mapHeight * tileSize - 1 + 5, 16,
				16);
		ctx.fillStyle = '#FFFFFF';
		ctx.fillText(transform(resources[i]), dimension[0] - 32
				* resources.length + i * 32, mapHeight * tileSize - 1
				+ tileSize + 3);
		if (i == 1) {
			ctx.fillText(transform(prevPow), dimension[0] - 32
					* resources.length + i * 32, mapHeight * tileSize - 1
					+ tileSize + 3 + 8 * 1);
			ctx.fillText(transform(currPow), dimension[0] - 32
					* resources.length + i * 32, mapHeight * tileSize - 1
					+ tileSize + 3 + 8 * 2);
		}
	}
	// TODO: console.log("Drawing slot!");
	var sz = (mapLength / 5 - 4) / 2;
	for (var i = 0; i < 2; i++)
		for (var j = 0; j < 2; j++) {
			var x = (mapLength / 5 * 4 + sz * i + 1.5) * tileSize;
			var y = (mapHeight - 2 * sz + j * sz) * tileSize;
			ctx.drawImage(images[sGui + 1], x, y);
			if (this.hasBlock && overlayMap[this.blockY][this.blockX] != null) {
				if (overlayMap[this.blockY][this.blockX].constructor == Turret) {
					var name = this.upgr[0][j * 2 + i + 1][0];
					if (this.upgr[0][j * 2 + i + 1][1] == 0) {
						ctx.drawImage(images[sGui + 8], x, y);
						ctx.fillText(name, x + tileSize / 2 - name.length
								* 1.75 - 2.25, y + tileSize + 9);
					}
				}
			}
		}
	ctx.font = backup;
	if (this.itemSelected != -1 && this.itemSelected * 2 + sOverlay < sProj) {
		ctx.drawImage(images[2 * this.itemSelected + sOverlay], mX - tileSize
				/ 2, mY - tileSize / 2);
		ctx.drawImage(images[2 * this.itemSelected + 1 + sOverlay], mX
				- tileSize / 2, mY - tileSize / 2);
	}
};
Shop.prototype.drawSlot = function(name, id, size, size2, resources, hasStack,
		tId, first) {
	var shouldMoveBack = resources.length != 0;
	ctx.drawImage(images[sGui + 1], (shouldMoveBack ? -tileSize / 2 : 0) + size
			+ (tileSize + size) * (id - 1), mapHeight * tileSize - 1 + size2);
	var draw = false;
	if (hasStack && sOverlay + tId * 2 + 1 < sProj) {
		ctx.drawImage(images[sOverlay + 2 * tId],
				(shouldMoveBack ? -tileSize / 2 : 0) + size + (tileSize + size)
						* (id - 1), mapHeight * tileSize - 1 + size2);
		ctx.drawImage(images[sOverlay + 2 * tId + 1],
				(shouldMoveBack ? -tileSize / 2 : 0) + size + (tileSize + size)
						* (id - 1), mapHeight * tileSize - 1 + size2);
		draw = true;
	}
	if (id == 1) {
		var type = this.where.endsWith("Attack") ? 1 : this.where
				.endsWith("Defense") ? 2 : this.where.endsWith("Special") ? 3
				: this.where.endsWith("Temporary") ? 4 : this.where
						.endsWith("Energy") ? 5 + 2 : this.where
						.endsWith("Plasma") ? 5 + 3 : this.where
						.endsWith("Steel") ? 5 + 4 : 0;
		if (type == 0) {
			if (!shouldMoveBack) {
				var pt = this.currArr.length > 1 ? this.currArr[1] : 0;
				var tid = pt[8];
				if (sOverlay + 2 * tid + 1 < sProj) {
					ctx.drawImage(images[sOverlay + 2 * tid],
							(shouldMoveBack ? -tileSize / 2 : 0) + size
									+ (tileSize + size) * (id - 1), mapHeight
									* tileSize - 1 + size2);
					ctx.drawImage(images[sOverlay + 2 * tid + 1],
							(shouldMoveBack ? -tileSize / 2 : 0) + size
									+ (tileSize + size) * (id - 1), mapHeight
									* tileSize - 1 + size2);
					draw = true;
				}
			}
			// TODO: Check in resources for an array at second, if it does have
			// that: check if the second index has something else than an array,
			// if yes: get 9th index and draw
		}
		if (!draw)
			ctx.drawImage(images[sGui + 3 + type],
					(shouldMoveBack ? -tileSize / 2 : 0) + size
							+ (tileSize + size) * (id - 1), mapHeight
							* tileSize - 1 + size2);
		draw = true;
	} else if (!draw) {
		var type = name.endsWith("Attack") ? 1 : name.endsWith("Defense") ? 2
				: name.endsWith("Special") ? 3 : name.endsWith("Temporary") ? 4
						: name.endsWith("Energy") ? 5 + 2 : name
								.endsWith("Plasma") ? 5 + 3 : name
								.endsWith("Steel") ? 5 + 4 : 0;
		ctx.drawImage(images[sGui + 3 + type], (shouldMoveBack ? -tileSize / 2
				: 0)
				+ size + (tileSize + size) * (id - 1), mapHeight * tileSize - 1
				+ size2);
		draw = true;
	}
	if (first)
		this.slot.push([
				(shouldMoveBack ? -tileSize / 2 : 0) + size + (tileSize + size)
						* (id - 1), mapHeight * tileSize - 1 + size2 ]);
	ctx.fillText(name, (shouldMoveBack ? -tileSize / 2 : 0) + size
			+ (tileSize + size) * (id - 1) - name.length, mapHeight * tileSize
			- 1 + tileSize + 3 / 8 * tileSize + size2);
	var j = 0;
	if (dev)
		for (var i = 1; i < resources.length; i++) {
			if (resources[i].constructor == Array)
				break;
			if (resources[i] == 0)
				continue;
			if (i > 7)
				continue;
			if ((id == 2 && i != resources.length - 2)
					|| (id != 2 && i != resources.length - 1)) {
				this.check(i - 1, resources[i], false);
				ctx.fillText(transform(resources[i]) + resource[i - 1][0],
						(shouldMoveBack ? -tileSize / 2 : 0) + size
								+ (tileSize + size) * (id - 1) + 17 / 16
								* tileSize + tileSize * Math.floor(j / 4),
						mapHeight * tileSize - 1 + tileSize - 1 / 16 * tileSize
								+ size2 - (j % 4) / 4 * tileSize);
			} else {
				this.check(i - 1, resources[i], true);
				ctx.fillText(transform(resources[i]),
						(shouldMoveBack ? -tileSize / 2 : 0) + size
								+ (tileSize + size) * (id - 1) + 3 / 32
								* tileSize, mapHeight * tileSize - 1 + tileSize
								+ size2 - 3 / 32 * tileSize);
				ctx.fillStyle = '#FFFFFF';
				continue;
			}
			ctx.fillStyle = '#FFFFFF';
			j++;
		}
};
Shop.prototype.check = function(resourc, value, bool) {
	var percentage = resources[resourc] / value;
	if (percentage >= 2)
		ctx.fillStyle = '#FFFFFF';
	else if (percentage > 1)
		ctx.fillStyle = '#0000A0';
	else if (percentage == 1)
		ctx.fillStyle = '#A0A000';
	else
		(!bool ? ctx.fillStyle = '#FF2222' : ctx.fillStyle = '#440000');
};
Shop.prototype.click = function(x, y) {
	if (y < mapHeight * tileSize) {
		if (x >= (mapLength - 1) * tileSize - (mapLength - 1) * tileSize / 5
				&& y >= mapHeight / 2 * tileSize - tileSize) {
			if (this.hasBlock || this.itemSelected != -1) {
				// TODO: Divs in here
				// Do stuff with that
			}
			return true;
		}
		var blockX = Math.floor(x / tileSize);
		var blockY = Math.floor(y / tileSize);
		if (blockX == this.blockX && blockY == this.blockY && this.hasBlock) {
			this.hasBlock = overlayMap[blockY][blockX] != null;
			if (this.hasBlock)
				return true;
			return false;
		}
		if (overlayMap[blockY][blockX] != null) {
			this.blockX = blockX;
			this.blockY = blockY;
			this.hasBlock = true;
			this.itemSelected = -1;
			return true;
		}
		return false;
	}
	var currArr = [];
	var where = "";
	for (var i = 0; i < this.selected.length; i++) {
		where += (where == "" ? "" : " - ")
				+ (i == 0 ? this.slots[0] + " - "
						+ this.slots[this.selected[i] + 1][0]
						: currArr[this.selected[i] + 1][0]);
		currArr = (i == 0 ? this.slots[this.selected[i] + 1]
				: currArr[this.selected[i] + 1]);
	}
	if (currArr.length == 0) {
		currArr = this.slots;
	}
	for (var i = 0; i < this.slot.length; i++) {
		var hasButton = false;
		if (currArr != this.slots)
			hasButton = true;
		var distanceY = Math.abs(this.slot[i][1] + tileSize / 2 - y);
		var distanceX = Math.abs(this.slot[i][0] + tileSize / 2 - x);
		if (distanceX <= tileSize / 2 && distanceY <= tileSize / 2) {
			if (currArr[1][1].constructor == Array && !(i == 0 && hasButton)) {
				this.selected.push(i - (hasButton ? 1 : 0));
				this.slot = [];
				this.itemSelected = -1;
				this.calculateRoute();
				return true;
			}
			if (i == 0 && hasButton) {
				this.selected.splice(this.selected.length - 1, 1);
				this.slot = [];
				this.itemSelected = -1;
				this.calculateRoute();
				return true;
			}
			this.itemSelected = currArr[1][8] + i + (hasButton ? -1 : 0);
			this.hasBlock = false;
			return true;
		}
	}
	this.clear();
	return true;
};
Shop.prototype.canPlace = function(i, j) {
	var id = map[j][i];
	var id2 = overlayMap[j][i];
	if (this.itemSelected == -1
			|| sOverlay + this.itemSelected * 2 + 1 >= sProj || id != 0
			|| id2 != null)
		return false;
	var currArr = [];
	var where = "";
	for (var x = 0; x < this.selected.length; x++) {
		where += (where == "" ? "" : " - ")
				+ (x == 0 ? this.slots[0] + " - "
						+ this.slots[this.selected[x] + 1][0]
						: currArr[this.selected[x] + 1][0]);
		currArr = (x == 0 ? this.slots[this.selected[x] + 1]
				: currArr[this.selected[x] + 1]);
	}
	for (var x = 0; x < resources.length; x++) {
		if (x == 1)
			continue;
		if (resources[x] < currArr[this.itemSelected - currArr[1][8] + 1][x + 1])
			return false;
	}
	var pw = 0;
	for (var x = 0; x < resources.length; x++)
		if (x != 1 && x < 6) {
			resources[x] -= currArr[this.itemSelected - currArr[1][8] + 1][x + 1];
		} else if (x == 1)
			pw = currArr[this.itemSelected - currArr[1][8] + 1][x + 1];
	if (this.setBlock(i, j, this.itemSelected, pw)) {
		currArr[this.itemSelected - currArr[1][8] + 1][3] *= 1.25;
		currArr[this.itemSelected - currArr[1][8] + 1][4] *= 1.25;
		currArr[this.itemSelected - currArr[1][8] + 1][5] *= 1.25;
		currArr[this.itemSelected - currArr[1][8] + 1][6] *= 1.25;
	}
	return true;
};
Shop.prototype.setBlock = function(i, j, id, pw) {
	if (id <= 4)
		overlayMap[j][i] = new Turret(i, j, 0, 1, id, pw);
	else if (id <= 4 + 7)
		overlayMap[j][i] = new PowerSource(i, j, 1, id - 5);
	else if (id <= 4 + 7 + 3)
		overlayMap[j][i] = new PlasmaSource(i, j, 1, id - 4 - 7, pw);
	else if (id <= 4 + 7 + 3 + 3)
		overlayMap[j][i] = new SteelSource(i, j, 1, id - 4 - 7 - 3, pw);
	else if (id <= 4 + 7 + 3 + 3 + 5)
		overlayMap[j][i] = new LaserTurret(i, j, 0, 1, id - 4 - 7 - 3 - 3, pw,
				0, 0);
	if (id <= 4 + 7 + 3 + 3 + 5)
		return true;
	return false;
};
// Path

function path(arr) {
	for (var k = 1; k < arr.length; k++) {
		var _x = arr[k - 1][0];
		var _y = arr[k - 1][1];
		var _xx = arr[k][0];
		var _yy = arr[k][1];
		var x = _x > _xx ? _x : _xx;
		var y = _y > _yy ? _y : _yy;
		var xx = _x < _xx ? _x : _xx;
		var yy = _y < _yy ? _y : _yy;
		var type = _x != _xx ? (_x < _xx ? 0 : 1) : y != _yy ? (_y > _yy ? 3
				: 2) : 2;
		for (var i = xx; i <= x; i++)
			for (var j = yy; j <= y; j++) {
				if (map[j][i] == 0)
					map[j][i] = type + 1;
				else {
					var t = map[j][i] - 1;
					if (type == 0 && t == 2)
						map[j][i] = 9; // DR
					else if (type == 1 && t == 2)
						map[j][i] = 10; // DL
					else if (type == 0 && t == 3)
						map[j][i] = 11; // UR
					else if (type == 1 && t == 3)
						map[j][i] = 12; // UL
					else if (type == 2 && t == 0)
						map[j][i] = 8; // LU
					else if (type == 2 && t == 1)
						map[j][i] = 7; // RU
					else if (type == 3 && t == 0)
						map[j][i] = 6; // LD
					else if (type == 3 && t == 1)
						map[j][i] = 5; // RD
					else if (type == 0 && (t == 4 | t == 8))
						map[j][i] = 15; // BD
					else if (type == 3 && (t == 4 | t == 8))
						map[j][i] = 16; // BL
					else if (type == 3 && (t == 9 | t == 5))
						map[j][i] = 14; // BL
				}
			}
	}
}
// Index helper

function index(item, arr) {
	for (var i = 0; i < arr.length; i++)
		if (arr[i] == item)
			return i;
	return -1;
}
// Out of bounds helper
function outOfBounds(x, y) {
	return x < 0 || y < 0 || x >= mapLength - 1 || y >= mapHeight;
}
// Path finder helper
function findPath(x) {
	var y = 0;
	var array = [];
	while (y < mapHeight) {
		if (map[y][x] != 0)
			array.push(y);
		y++;
	}
	return array;
}
function randomPath(x) {
	var p = findPath(x);
	if (p.length == 0)
		return -1;
	return p[Math.floor(Math.random() * p.length)];
}
function getRandom(entity) {
	entity.x = 0;
	var p = findPath(Math.floor(entity.x / tileSize));
	var wav = (resources[6] - 1) * 10 + horde;
	var y = -1;
	while (y == -1) {
		var index = Math.floor(p.length * Math.random());
		var chance = Math.pow(2, -index);
		if (chance != 1)
			chance *= (wav + 1) / 5;
		if (Math.random() > chance)
			continue;
		y = p[index] * tileSize;
	}
	entity.y = y;
}
// Path finding
var grid;

// Pathfinding; Sebastian Lague's C# code formatted to JavaScript by
// Nielsbwashere
function getPath(start, end, width, height, eWidth, eHeight, player) {
	grid = new Grid(player);
	var nStart = grid.nodeFromLocation(start[0], start[1], width, height);
	var nEnd = grid.nodeFromLocation(end[0], end[1], width, height);
	var closed = [];
	var open = [ nStart ];
	while (open.length > 0) {
		var current = open[0];
		for (var i = 1; i < open.length; i++)
			if (open[i].fCost < current.fCost
					|| (open[i].fCost == current.fCost && open[i].hCost < current.hCost))
				current = open[i];
		if (index(current, open) >= 0)
			open.splice(index(current, open), 1);
		if (index(current, closed) == -1)
			closed.push(current);
		if (current == nEnd)
			return retracePath(nEnd, nStart);
		var neighbours = grid.getNeighbours(current);
		for (var i = 0; i < neighbours.length; i++) {
			var neighbour = neighbours[i];
			if (!neighbour.walkable || index(neighbour, closed) >= 0
					|| !canTransfer(neighbour, current))
				continue;
			var mCost = current.gCost + distance(current, neighbour);
			if (mCost < neighbour.gCost || /** !open.contains(neighbour)* */
			index(neighbour, open) == -1) {
				neighbour.gCost = mCost;
				neighbour.hCost = distance(neighbour, nEnd);
				neighbour.parent = current;
				if (index(neighbour, open) == -1)
					open.push(neighbour);
			}
		}
	}
	console.log("No path found!");
	return [];
}
function canTransfer(neighbour, current) {
	var difY = neighbour.y - current.y;
	var difX = neighbour.x - current.x;
	var dia = !(difY != 0 && difX != 0);
	if (dia)
		return true;
	for (var i = 0; i <= 1; i++)
		for (var j = 0; j <= 1; j++) {
			var rI = difX < 0 ? -i : i;
			var rJ = difY < 0 ? -j : j;
			if (grid.grid[(rJ + current.y) * mapLength + (rI + current.x)].walkable)
				continue;
			return false;
		}
	return true;
}
function retracePath(nEnd, nStart) {
	var arr = [];
	var curr = nEnd;
	while (curr != nStart) {
		arr.push([ curr.x, curr.y ]);
		curr = curr.parent;
	}
	return arr;
}
function distance(a, b) {
	var distX = Math.abs(a.x - b.x);
	var distY = Math.abs(a.y - b.y);
	if (distX > distY)
		return 14 * distY + 10 * (distX - distY);
	return 14 * distY + 10 * (distY - distX);
}
// Node; Sebastian Lague's C# code formatted to JavaScript by Nielsbwashere
function Node(x, y, player) {
	this.walkable = overlayMap[y][x] == null
			&& ((!player && map[y][x] != 0) || (player && map[y][x] == 0));
	this.x = x;
	this.y = y;
	this.gCost = 0;
	this.hCost = 0;
	this.parent = null;
	this.heapIndex = 0;
}
Node.prototype.fCost = function() {
	return this.gCost + this.hCost;
};
// Grid; Sebastian Lague's C# code formatted to JavaScript by Nielsbwashere
function Grid(player) {
	this.grid = [];
	for (var j = 0; j < mapHeight; j++)
		for (var i = 0; i < mapLength; i++)
			this.grid.push(new Node(i, j, player));
}
Grid.prototype.getNeighbours = function(node) {
	var neighbours = [];
	for (var i = -1; i <= 1; i++)
		for (var j = -1; j <= 1; j++) {
			if (!(i == 0 && j == 0) && !outOfBounds(i + node.x, j + node.y))
				neighbours.push(this.grid[(j + node.y) * mapLength
						+ (i + node.x)]);
		}
	return neighbours;
};
Grid.prototype.nodeFromLocation = function(x, y, width, height) {
	var i = Math.floor((x + width / 2) / tileSize);
	var j = Math.floor((y + height / 2) / tileSize);
	return this.grid[j * mapLength + i];
};
// Heap; Sebastian Lague's C# code formatted to JavaScript by Nielsbwashere

// Objects

// Turrets
function Turret(i, j, rot, lvl, type, initial) {
	this.x = i;
	this.y = j;
	this.level = lvl;
	this.range = tileSize
			* Math.round(Math.pow(this.level + 1, 1.5) / 2 + this.level)
			* (type == 0 ? 1.5 : 1);
	this.dmg = Math.sqrt((Math.log(lvl) + Math.pow(lvl, 1.2) * 10)
			* Math.pow(type + 2, 4.5) * (Math.sqrt(type * 5 + 1) + 1 + type)
			/ 2.5)
			* (type + 8) / 8;
	this.enemy = null;
	this.isGoingLeft = false;
	this.recharge = 0;
	this.power = initial + 8 * Math.pow(this.level - 1, 1.1) + Math.random()
			* (this.level - 1);
	this.rotationSpeed = 1.8 * (type != 1 ? 3 : 2);
	this.rotation = rot;
	this.start = rot;
	this.type = type;
	this.takesPower = true;
}
Turret.prototype.update = function() {
	if (this.recharge > 0)
		this.recharge--;
	if (this.enemy === null) {
		for (var i = 0; i < entities.length; i++)
			if (this.inRange(entities[i])) {
				/**
				 * TODO: Make sure that there's nothing in the way of the
				 * bullet*
				 */
				this.enemy = entities[i];
				break;
			}
		if (this.enemy === null)
			return false;
		else
			return true;
	} else {
		if (this.enemy.dead) {
			this.enemy = null;
			return true;
		}
		var ydif = this.enemy.y - this.y * tileSize;
		var xdif = this.enemy.x - this.x * tileSize;
		var dif = Math.sqrt(Math.pow(ydif, 2) + Math.pow(xdif, 2));
		if (dif >= this.range * 1.2) {
			this.enemy = null;
			return true;
		}
		var angle = Math.atan2(ydif, xdif) / Math.PI * 180.0 + 90;
		if (this.turn(angle)) {
			if (this.recharge == 0
					&& resources[2] >= this.level * this.type + 1) {
				projectiles.push(new Bullet(this.x, this.y, xdif / 10
						* (this.type == 3 ? 8 + this.level / 5 : 1), ydif / 10
						* (this.type == 3 ? 8 + this.level / 5 : 1), this.dmg,
						this.rotation));
				this.recharge = (this.type == 1 ? 50 : 30) - (this.level - 1)
						* (this.type == 2 ? 5 : 2);
				play('turret_shoot', 0.5);
				if (Math.random() < 0.1)
					resources[2] -= this.level * (this.type + 1);
			}
		}
		this.start = this.rotation;
		return true;
	}
};
Turret.prototype.turn = function(angle) {
	this.rotation = fix(this.rotation);
	angle = fix(angle);
	if (angle == this.rotation)
		return true;
	var goesLeft = this.rotation > angle ? this.rotation - angle > 360
			- this.rotation + angle : angle - this.rotation < 360 - angle
			+ this.rotation;
	if (goesLeft) {
		this.rotation += this.rotationSpeed;
		var stillLeft = this.rotation > angle ? this.rotation - angle > 360
				- this.rotation + angle : angle - this.rotation < 360 - angle
				+ this.rotation;
		if (!stillLeft) {
			this.rotation = angle;
			return true;
		}
	} else {
		this.rotation -= this.rotationSpeed;
		var left = this.rotation > angle ? this.rotation - angle > 360
				- this.rotation + angle : angle - this.rotation < 360 - angle
				+ this.rotation;
		if (left) {
			this.rotation = angle;
			return true;
		}
	}
	return false;
};
Turret.prototype.inRange = function(entity) {
	return Math.sqrt(Math.pow(entity.x - this.x * tileSize, 2)
			+ Math.pow(entity.y - this.y * tileSize, 2)) <= this.range;
};
Turret.prototype.searchEnemy = function() {
	for (var i = 0; i < entities.length; i++)
		if (this.inRange(entities[i]) && this.enemy != entities[i])
			return entities[i];
	return this.enemy;
};
Turret.prototype.draw = function() {
	ctx.save();
	ctx.translate(this.x * tileSize, this.y * tileSize);
	img = images[sOverlay + this.type * 2];
	ctx.drawImage(img, 0, 0);
	ctx.translate(tileSize / 2, tileSize / 2);
	ctx.rotate(this.rotation / 180.0 * Math.PI);
	ctx.translate(-tileSize / 2, -tileSize / 2);
	img = images[sOverlay + this.type * 2 + 1];
	ctx.drawImage(img, 0, 0);
	ctx.restore();
	if ((shop.blockX == this.x && shop.blockY == this.y && shop.hasBlock)
			|| dev) {
		ctx.fillStyle = "#FF0000";
		ctx.beginPath();
		ctx.arc(this.x * tileSize + tileSize / 2, this.y * tileSize + tileSize
				/ 2, this.range, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fillStyle = "#FF0000";
		ctx.beginPath();
		ctx.arc(this.x * tileSize + tileSize / 2, this.y * tileSize + tileSize
				/ 2, this.range * 1.2, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fillStyle = "#FFFFFF";
	}
};
// lasers
// Turrets
function LaserTurret(i, j, rot, lvl, type, initial, lens, lenstype) {
	this.x = i;
	this.y = j;
	this.level = lvl;
	this.range = 1.5 * tileSize
			* Math.round(Math.pow(this.level + 1, 1.5) / 2 + this.level)
			* (type == 0 ? 1.5 : 1);
	if (this.range > 7.5 * tileSize)
		this.range = 7.5 * tileSize;
	this.dmg = ((lens != 1 ? 0.2 : 0.4) + (lens != 0 ? 0.1 : 0) - (lens == 4 ? 0.20 - lenstype * 0.01
			: 0))
			* Math.sqrt((Math.log(lvl) + Math.pow(lvl, 1.2) * 10)
					* Math.pow(type + 2, 4.5)
					* (Math.sqrt(type * 5 + 1) + 1 + type) / 2.5)
			* (type + 8)
			/ 8;
	if (lens == 3)
		this.dmg /= 1.5;
	this.dmg = Math.round(this.dmg * 100) / 100;
	this.isGoingLeft = false;
	this.recharge = 0;
	this.power = initial + 8 * Math.pow(this.level - 1, 1.1) + Math.random()
			* (this.level - 1);
	this.power = Math.round(this.power * 100) / 100;
	this.rotationSpeed = 2.2 * (type != 1 ? 3 : 2);
	this.rotation = rot;
	this.start = rot;
	this.type = type;
	this.takesPower = true;
	if (lens != 4 && lens != 3) {
		this.laser = null;
		this.enemy = null;
	} else {
		this.max = Math.floor(lenstype / 2 + 1);
		this.laser = [];
		this.enemy = [];
		for (var i = 0; i < this.max; i++)
			this.laser[i] = this.enemy[i] = null;
	}
	this.lens = lens;
	this.lensLevel = lenstype;
	if (this.lens == 2)
		this.color = "#A000A0";
	else if (this.lens == 1)
		this.color = "#11A011";
	else if (this.lens == 4)
		this.color = "#FF3030";
	else if (this.lens == 3)
		this.color = "#00A0A0";
	else
		this.color = "#00A000";
}
LaserTurret.prototype.update = function() {
	if (this.recharge > 0)
		this.recharge--;
	if (this.recharge < 0)
		this.recharge = 0;
	if (this.lens != 4 && this.lens != 3) {
		if (this.laser != null && this.laser.dead)
			this.laser = null;
		if (this.enemy === null) {
			for (var i = 0; i < entities.length; i++)
				if (this.inRange(entities[i])) {
					this.enemy = entities[i];
					break;
				}
			if (this.enemy === null)
				return false;
			else
				return true;
		} else {
			if (this.enemy.dead) {
				this.enemy = null;
				return true;
			}
			var ydif = this.enemy.y - this.y * tileSize;
			var xdif = this.enemy.x - this.x * tileSize;
			var dif = Math.sqrt(Math.pow(ydif, 2) + Math.pow(xdif, 2));
			if (dif >= this.range * 1.2) {
				this.enemy = null;
				return true;
			}
			var angle = Math.atan2(ydif, xdif) / Math.PI * 180.0 + 90;
			if (this.turn(angle)) {
				if (this.recharge == 0 && this.laser == null) {
					projectiles.push(this.laser = new Laser(this.x, this.y,
							this.dmg, this.color, this.enemy, tileSize
									/ 8
									* (this.lens != 2 ? 1
											: this.lensLevel / 2.5),
							this.range * 1.2, null, -1, -1));
					this.recharge = (this.type == 1 ? 30 : 10)
							- (this.level / 10) * (this.type == 2 ? 10 : 7);
				}
			}
			this.start = this.rotation;
			return true;
		}
	} else if (this.lens == 4) {
		var power = false;
		for (var i = 0; i < this.max; i++) {
			if (this.enemy[i] != null && this.enemy[i].dead)
				this.enemy[i] = null;
			if (this.enemy[i] == null) {
				for (var j = 0; j < entities.length; j++) {
					if (!this.enemy.contains(entities[j])
							&& this.inRange(entities[j])) {
						this.enemy[i] = entities[j];
						break;
					}
				}
			} else {
				var ydif = this.enemy[i].y - this.y * tileSize;
				var xdif = this.enemy[i].x - this.x * tileSize;
				var dif = Math.sqrt(Math.pow(ydif, 2) + Math.pow(xdif, 2));
				var b = false;
				if (dif >= this.range * 1.2) {
					this.enemy[i] = null;
					power = true;
					b = true;
				}
				if (!b) {
					if (this.laser[i] != null && this.laser[i].dead)
						this.laser[i] = null;
					if (this.laser[i] == null) {
						projectiles.push(this.laser[i] = new Laser(this.x,
								this.y, this.dmg, this.color, this.enemy[i],
								tileSize
										/ 8
										* (this.lens != 2 ? 1
												: this.lensLevel / 2.5),
								this.range * 1.2, null, -1, -1));
					}
					power = true;
				}
			}
		}
		return power;
	} else {
		var power = false;
		for (var i = 0; i < this.max; i++) {
			if (this.enemy[i] == null
					&& (i == 0 || (i > 0 && this.enemy[i - 1] != null))) {
				// TODO: Maybe some things don't like to become an enemy?
				for (var j = 0; j < entities.length; j++) {
					if (!this.enemy.contains(entities[j])
							&& this.inRange(entities[j])
							&& (i == 0 || (i > 0 && this.enemy[i - 1] == null) || (Math
									.sqrt(Math.pow(entities[j].x
											- this.enemy[i - 1].x, 2)
											+ Math.pow(entities[j].y
													- this.enemy[i - 1].y, 2)) <= this.max
									/ 2 * tileSize + tileSize))) {
						this.enemy[i] = entities[j];
						break;
					}
				}
			} else {
				if ((this.enemy[i] != null && this.enemy[i].dead)
						|| (this.laser[i] != null && this.laser[i].dead)
						|| (i > 0 && this.enemy[i - 1] == null)) {
					if (this.laser[i] != null)
						this.laser[i].remove();
					this.enemy[i] = this.laser[i] = null;
					continue;
				}
				if (this.laser[i] == null) {
					if (i == 0)
						projectiles.push(this.laser[i] = new Laser(this.x,
								this.y, this.dmg, this.color, this.enemy[i],
								tileSize
										/ 8
										* (this.lens != 2 ? 1
												: this.lensLevel / 2.5),
								this.range * 1.2, null, -1, -1));
					else
						projectiles.push(this.laser[i] = new Laser(
								this.enemy[i - 1].x / tileSize,
								this.enemy[i - 1].y / tileSize, this.dmg,
								this.color, this.enemy[i], tileSize
										/ 8
										* (this.lens != 2 ? 1
												: this.lensLevel / 2.5),
								this.range * 1.2, this.enemy[i - 1], this.x,
								this.y));
				}
			}
		}
		return power;
	}
	return false;
};
LaserTurret.prototype.turn = function(angle) {
	angle = val(angle);
	this.rotation = val(this.rotation);
	var a = angle - this.rotation;
	a = Math.abs((a + 180) % 360) - 180;
	if (Math.abs(a) > 5) {
		this.rotation += (a < 0 ? -1 : 1) * this.rotationSpeed;
		return false;
	}
	this.rotation = angle;
	return true;
};
LaserTurret.prototype.inRange = function(entity) {
	return Math.sqrt(Math.pow(entity.x - this.x * tileSize, 2)
			+ Math.pow(entity.y - this.y * tileSize, 2)) <= this.range;
};
LaserTurret.prototype.searchEnemy = function() {
	for (var i = 0; i < entities.length; i++)
		if (this.inRange(entities[i]) && this.enemy != entities[i])
			return entities[i];
	return this.enemy;
};
LaserTurret.prototype.draw = function() {
	ctx.save();
	ctx.translate(this.x * tileSize, this.y * tileSize);
	img = images[sOverlay + 34 + this.type * 2];
	ctx.drawImage(img, 0, 0);
	ctx.translate(tileSize / 2, tileSize / 2);
	ctx.rotate(this.rotation / 180.0 * Math.PI);
	ctx.translate(-tileSize / 2, -tileSize / 2);
	img = images[sOverlay + 34 + this.type * 2 + 1];
	ctx.drawImage(img, 0, 0);
	ctx.restore();
	if ((shop.blockX == this.x && shop.blockY == this.y && shop.hasBlock)
			|| dev) {
		ctx.fillStyle = "#FF0000";
		ctx.beginPath();
		ctx.arc(this.x * tileSize + tileSize / 2, this.y * tileSize + tileSize
				/ 2, this.range, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fillStyle = "#FF0000";
		ctx.beginPath();
		ctx.arc(this.x * tileSize + tileSize / 2, this.y * tileSize + tileSize
				/ 2, this.range * 1.2, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fillStyle = "#FFFFFF";
	}
};

// powersource
function PowerSource(i, j, lvl, type) {
	this.x = i;
	this.y = j;
	this.level = lvl;
	this.minPower = (8 * Math.pow(type, 1.5) * lvl + 8 * lvl)
			* (type == 0 || type == 2 ? 0.6 : 1) + 1;
	this.maxPower = type == 0 || type == 2 ? this.minPower / 0.6 * 1.4
			: this.minPower;
	this.power = (this.maxPower - this.minPower) * Math.random()
			+ this.minPower;
	this.type = type;
	this.takesPower = false;
	this.rotation = 0;
}
PowerSource.prototype.update = function() {
	this.power = (this.maxPower - this.minPower) * Math.random()
			+ this.minPower;
	if (this.type == 0)
		this.rotation += Math.random() * 15 - Math.random() * 15;
	return true;
};
PowerSource.prototype.draw = function() {
	img = images[sOverlay + 5 * 2 + this.type * 2];
	ctx.save();
	ctx.translate(this.x * tileSize, this.y * tileSize);
	ctx.translate(tileSize / 2, tileSize / 2);
	ctx.rotate(this.rotation / 180.0 * Math.PI);
	ctx.translate(-tileSize / 2, -tileSize / 2);
	ctx.drawImage(img, 0, 0);
	ctx.restore();
};
function PlasmaSource(i, j, lvl, type, pwr) {
	this.x = i;
	this.y = j;
	this.level = lvl;
	this.power = pwr;
	this.type = type;
	this.takesPower = true;
	this.rotation = 0;
	this.plasma = Math.pow((lvl + 1) * (type + 1) + 3 * Math.pow(type + 1, 2),
			2) / 6000 / 9;
}
PlasmaSource.prototype.update = function() {
	resources[2] += this.plasma;
	return true;
};
PlasmaSource.prototype.draw = function() {
	img = images[sOverlay + 5 * 2 + 6 * 2 + this.type * 2];
	ctx.save();
	ctx.translate(this.x * tileSize, this.y * tileSize);
	ctx.translate(tileSize / 2, tileSize / 2);
	ctx.rotate(this.rotation / 180.0 * Math.PI);
	ctx.translate(-tileSize / 2, -tileSize / 2);
	ctx.drawImage(img, 0, 0);
	ctx.restore();
};
function SteelSource(i, j, lvl, type, pwr) {
	this.x = i;
	this.y = j;
	this.level = lvl;
	this.power = pwr;
	this.type = type;
	this.takesPower = true;
	this.rotation = 0;
	this.steel = Math
			.pow((lvl + 1) * (type + 1) + 3 * Math.pow(type + 1, 2), 2) / 6000 / 7;
}
SteelSource.prototype.update = function() {
	resources[3] += this.steel;
	return true;
};
SteelSource.prototype.draw = function() {
	img = images[sOverlay + 5 * 2 + 6 * 2 + 3 * 2 + this.type * 2];
	ctx.save();
	ctx.translate(this.x * tileSize, this.y * tileSize);
	ctx.translate(tileSize / 2, tileSize / 2);
	ctx.rotate(this.rotation / 180.0 * Math.PI);
	ctx.translate(-tileSize / 2, -tileSize / 2);
	ctx.drawImage(img, 0, 0);
	ctx.restore();
};
// Projectiles
// Bullet
function Bullet(x, y, motX, motY, dmg, rot) {
	this.x = x * tileSize;
	this.y = y * tileSize;
	this.motX = motX;
	this.motY = motY;
	this.dmg = dmg;
	this.i = Math.floor(x);
	this.j = Math.floor(y);
	this.rot = rot;
	this.isAlive = false;
}
Bullet.prototype.update = function() {
	this.x += this.motX;
	this.y += this.motY;
	for (var i = 0; i < entities.length; i++) {
		var entity = entities[i];
		var difX = this.x - entity.x;
		var difY = this.y - entity.y;
		var rad = Math.sqrt(Math.pow(difX, 2) + Math.pow(difY, 2));
		if (rad > tileSize * 9 / 16)
			continue;
		this.remove();
		entity.damage(this.dmg);
		return;
	}
	if (this.x < 0 || this.y < 0 || this.x > dimension[0]
			|| this.y > dimension[1])
		this.remove();
	// TODO: Collide with obstacles, it can't collide with thing at this.i,
	// this.j
};
Bullet.prototype.remove = function() {
	this.dead = true;
	var j = -1;
	for (var i = 0; i < projectiles.length; i++)
		if (projectiles[i] == this) {
			j = i;
			break;
		}
	if (j == -1)
		return;
	projectiles.splice(j, 1);
};
Bullet.prototype.draw = function() {
	var img = images[sProj];
	ctx.save();
	ctx.translate(this.i * tileSize + tileSize / 2, this.j * tileSize
			+ tileSize / 2);
	ctx.rotate(this.rot / 180.0 * Math.PI);
	ctx.translate(-tileSize / 2, -tileSize / 2);
	ctx.translate(0, -Math.sqrt(Math.pow(this.y - this.j * tileSize, 2)
			+ Math.pow(this.x - this.i * tileSize, 2)));
	ctx.drawImage(img, 0, 0);
	ctx.restore();
};

// Laser
function Laser(x, y, dmg, color, entity, lineWidth, maxLength, focus, orgX,
		orgY) { // TODO: Lasers can be a bit buggy?
	this.x = x * tileSize;
	this.y = y * tileSize;
	this.originX = orgX < 0 ? x + 0.5 : orgX + 0.5;
	this.originY = orgY < 0 ? y + 0.5 : orgY + 0.5;
	this.motX = 0;
	this.motY = 0;
	this.dmg = Math.round(dmg * 100) / 100;
	this.color = color;
	this.i = Math.floor(x);
	this.j = Math.floor(y);
	this.target = entity;
	this.width = lineWidth;
	this.isAlive = false;
	this.maxLength = maxLength;
	this.focus = focus;
	this.play = false;
}
Laser.prototype.update = function() {
	if (this.target.dead || (this.focus != null && this.focus.dead)) {
		this.remove();
		return;
	}
	if (this.focus != null) {
		this.x = this.focus.x;
		this.y = this.focus.y;
	}
	var ydif = this.target.y - this.originX * tileSize;
	var xdif = this.target.x - this.originY * tileSize;
	var dif = Math.sqrt(Math.pow(ydif, 2) + Math.pow(xdif, 2));
	if (dif > this.maxLength) {
		this.remove();
		return;
	}
	if (this.x < 0 || this.y < 0 || this.x > dimension[0]
			|| this.y > dimension[1])
		this.remove();
	if (!this.play) {
		this.play = true;
		play('laser', 4);
	}
	this.x += this.motX;
	this.y += this.motY;
	for (var i = 0; i < entities.length; i++) {
		var entity = entities[i];
		this.intersect(entity);
	}
};
Laser.prototype.remove = function() {
	this.dead = true;
	var j = -1;
	for (var i = 0; i < projectiles.length; i++)
		if (projectiles[i] == this) {
			j = i;
			break;
		}
	if (j == -1)
		return;
	projectiles.splice(j, 1);
};
Laser.prototype.draw = function() {
	var img = images[sProj];
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(this.x + tileSize / 2, this.y + tileSize / 2);
	ctx.strokeStyle = this.color;
	ctx.lineWidth = this.width;
	ctx.lineTo(this.target.x + tileSize / 2, this.target.y + tileSize / 2);
	ctx.stroke();
	ctx.restore();
};
Laser.prototype.intersect = function(entity) {
	if (typeof this.dmg === "undefined")
		return;
	if (!entity.isAlive)
		return;
	if (!entity.isEnemy)
		return;
	var X = this.target.x > this.x ? this.target.x : this.x;
	var x = X == this.x ? this.target.x : this.x;
	var Y = this.target.y > this.y ? this.target.y : this.y;
	var y = Y == this.y ? this.target.y : this.y;
	if (entity.x < x || entity.x > X || entity.y < y || entity.y > Y)
		return;
	var a = ((X == this.target.x ? this.target.y : this.y) - (X != this.target.x ? this.target.y
			: this.y))
			/ (X - x);
	var b = Y - a * (Y == this.target.y ? this.target.x : this.x);
	var _Y = a * entity.x + b;
	var dif = Math.abs(_Y - entity.y);
	if (dif > this.width)
		return;
	var val = dif / this.width * (this.dmg * (1.2 - dif / this.maxLength));
	if (val < this.dmg * 0.1)
		val = this.dmg * 0.1;
	val = Math.round(val * 100) / 100;
	if (Number.isNaN(val))
		return;
	entity.damage(val);
};

// Entities

// RobotRunner (Normal robot)
function RobotRunner(x, y, health, speed, coins) {
	this.x = x;
	this.y = y;
	this.maxHealth = health;
	this.health = this.maxHealth;
	this.speed = speed;
	this.heading = 90;
	this.rotation = this.heading;
	this.prev = [];
	this.dead = false;
	this.rotationSpeed = 0.5 * 12.5 / 1.2 * this.speed;
	if (this.rotationSpeed > 10)
		this.rotationSpeed = 10;
	this.path = [];
	this.coins = coins;
	this.isAlive = true;
	this.isEnemy = true;
}
RobotRunner.prototype.update = function() {
	if (Number.isNaN(this.health))
		this.health = 0;
	if (this.health <= 0) {
		this.remove();
		return;
	}
	if (path.length > 0)
		this.headTo();
};
RobotRunner.prototype.seek = function() {
	this.path = getPath([ this.x, this.y ], [ 39 * tileSize,
			randomPath(39) * tileSize ], tileSize, tileSize, 0, 0, false);
};
RobotRunner.prototype.headTo = function() { // TODO: special robots! (Tank,
	// explosive, laser eyes, melee,
	// flying, energy sucking)
	var p = this.path.length - 1;
	var angle = this.path.length > 0 ? getAngle(this.prev.length == 0 ? [
			this.x, this.y ] : times(this.prev, tileSize), times(this.path[p],
			tileSize)) : -1;
	if (angle < 0)
		return;
	if (this.turn(angle)) {
		var mx = Math.cos(val(this.rotation - 90) / 180 * Math.PI);
		var my = Math.sin(val(this.rotation - 90) / 180 * Math.PI);
		mx = Math.round(mx, 2);
		my = Math.round(my, 2);
		this.x += mx * this.speed;
		this.y += my * this.speed;
		if (this.reachedDest(this.path[p])) {
			this.prev = this.path[p];
			this.x = this.path[p][0] * tileSize;
			this.y = this.path[p][1] * tileSize;
			this.path.splice(this.path.length - 1, 1);
			var p = this.path.length - 1;
			if (p <= 0) {
				getRandom(this);
				this.rotation = 90; // TODO: Fix that they trip like a
				// son-of-a-bich
				this.seek();
				removeLife();
			}
		}
	}
};
// RobotRunner.prototype.reachedDest = function(path) {
// path[0] *= tileSize;
// path[1] *= tileSize;
// var facing = this.getFacing();
// var rot = val(this.rotation);
// var left = Math.abs(rot - 270) < 5;
// var up = Math.abs(rot - 180) < 5;
// var right = Math.abs(rot - 90) < 5;
// var down = Math.abs(rot) < 5;
// var xdist = (path[0] + (!left ? 31 : 0)) - facing[0];
// var ydist = (path[1] + (!down ? 31 : 0)) - facing[1];
// xdist = Math.round(xdist, 0);
// ydist = Math.round(ydist, 0);
// var xd = Math.abs(xdist);
// var yd = Math.abs(ydist);
// path[0] /= tileSize;
// path[1] /= tileSize;
// var mx = this.speed
// * Math.round(Math.cos(val(this.rotation - 90) / 180 * Math.PI), 2);
// var my = this.speed
// * Math.round(Math.sin(val(this.rotation - 90) / 180 * Math.PI), 2);
// if (right && (xdist < 0 || (xdist > 0 && xd < Math.abs(mx))))
// return true;
// else if (left && (xdist > 0 || (xdist < 0 && xd < Math.abs(mx))))
// return true;
// if (down && (ydist > 0 || (ydist < 0 && yd < Math.abs(my))))
// return true;
// else if (up && (ydist < 0 || (ydist > 0 && yd < Math.abs(my))))
// return true;
// return false;
// };
RobotRunner.prototype.reachedDest = function(path) {
	var mx = Math.cos((this.rotation - 90) / 180 * Math.PI);
	var my = Math.sin((this.rotation - 90) / 180 * Math.PI);
	var x = Math.round(this.x + tileSize / 2);
	var y = Math.round(this.y + tileSize / 2);
	var xDest = path[0] * tileSize + tileSize / 2;
	var yDest = path[1] * tileSize + tileSize / 2;
	return (mx < 0 ? x <= xDest : x >= xDest)
			&& (my < 0 ? y <= yDest : y >= yDest);
}
RobotRunner.prototype.getFacing = function() {
	return [
			this.x + tileSize / 2
					+ Math.cos(val(this.rotation - 90) / 180 * Math.PI)
					* tileSize / 2,
			this.y + tileSize / 2
					+ Math.sin(val(this.rotation - 90) / 180 * Math.PI)
					* tileSize / 2 ];
};
RobotRunner.prototype.draw = function() {
	var img = images[sEnt];
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.translate(tileSize / 2, tileSize / 2);
	ctx.rotate(this.rotation / 180.0 * Math.PI);
	ctx.translate(-tileSize / 2, -tileSize / 2);
	ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, tileSize, tileSize);
	ctx.restore();
	if (this.health != this.maxHealth) {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.fillStyle = this.health < this.maxHealth / 8 ? '#FF0000'
				: this.health < this.maxHealth / 2 ? '#FFFF00' : '#00FF00';
		ctx.fillRect(0, -5, tileSize * this.health / this.maxHealth, -3);
		ctx.restore();
	}

};
RobotRunner.prototype.damage = function(amount) {
	if (Number.isNaN(amount))
		amount = 0.1;
	amount = Math.round(amount * 100) / 100;
	if (amount >= this.health) {
		this.remove();
		this.dead = true;
		kill++;
		resources[4] += this.coins;
		return;
	}
	this.health -= amount;
};
RobotRunner.prototype.remove = function() {
	this.dead = true;
	var j = -1;
	for (var i = 0; i < entities.length; i++)
		if (entities[i] == this) {
			j = i;
			break;
		}
	if (j == -1)
		return;
	entities.splice(j, 1);
};
// RobotRunner.prototype.turn = function(angle) {
// angle = val(angle);
// this.rotation = val(this.rotation);
// var a = angle - this.rotation;
// a = Math.abs((a + 180) % 360) - 180;
// if (angle == 0 && this.rotation >= 270)
// a = -a;
// if (Math.abs(a) > 5) {
// this.rotation += (a < 0 ? -1 : 1) * this.rotationSpeed;
// return false;
// }
// this.rotation = angle;
// return true;
// };

RobotRunner.prototype.turn = function(angle) {
	this.rotation = fix(this.rotation);
	angle = fix(angle);
	if (angle == this.rotation)
		return true;
	var goesLeft = this.rotation > angle ? this.rotation - angle > 360
			- this.rotation + angle : angle - this.rotation < 360 - angle
			+ this.rotation;
	if (goesLeft) {
		this.rotation += this.rotationSpeed;
		var stillLeft = this.rotation > angle ? this.rotation - angle > 360
				- this.rotation + angle : angle - this.rotation < 360 - angle
				+ this.rotation;
		if (!stillLeft) {
			this.rotation = angle;
			return true;
		}
	} else {
		this.rotation -= this.rotationSpeed;
		var left = this.rotation > angle ? this.rotation - angle > 360
				- this.rotation + angle : angle - this.rotation < 360 - angle
				+ this.rotation;
		if (left) {
			this.rotation = angle;
			return true;
		}
	}
	return false;
};

// Player (Helps you kill things)
function Player() {
	this.x = dimension[0] / 2;
	this.y = dimension[1] / 2;
	this.motX = 0;
	this.motY = 0;
	this.maxHealth = 500;
	this.health = this.maxHealth;
	this.speed = 3.0;
	this.rotation = 0;
	this.dead = false;
	this.desi = null;
	this.enemy = null;
	this.dmg = 100;
	this.range = 48;
	this.recharge = 0;
	var rot = 90;
	this.heading = rot;
	this.start = rot;
	this.rotationSpeed = 4.8;
	this.rotation = rot;
	this.path = [];
	this.prev = [];
	this.isAlive = true;
	this.isEnemy = false;
}
Player.prototype.inRange = function(entity) {
	return Math.sqrt(Math.pow(entity.x - this.x, 2)
			+ Math.pow(entity.y - this.y, 2)) <= this.range;
};
Player.prototype.searchEnemy = function() {
	for (var i = 0; i < entities.length; i++)
		if (this.inRange(entities[i]) && this.enemy != entities[i])
			return entities[i];
	return this.enemy;
};
Player.prototype.update = function() {
	if (Number.isNaN(this.health))
		this.health = 0;
	this.health = Math.round(this.health * 100) / 100;
	if (this.path.length == 0) {
		if (this.recharge > 0)
			this.recharge--;
		if (this.enemy === null) {
			for (var i = 0; i < entities.length; i++)
				if (this.inRange(entities[i])) {
					/**
					 * TODO: Make sure that there's nothing in the way of the
					 * bullet*
					 */
					this.enemy = entities[i];
					break;
				}
			if (this.enemy === null)
				return false;
			else
				return true;
		} else {
			if (this.enemy.dead) {
				this.enemy = null;
				return true;
			}
			var ydif = this.enemy.y - this.y;
			var xdif = this.enemy.x - this.x;
			var dif = Math.sqrt(Math.pow(ydif, 2) + Math.pow(xdif, 2));
			if (dif >= this.range * 1.2) {
				this.enemy = null;
				return true;
			}
			var angle = Math.atan2(ydif, xdif) / Math.PI * 180.0 + 90;
			if (this.turn(angle)) {
				if (this.recharge == 0) {
					projectiles.push(new Bullet(this.x / tileSize, this.y
							/ tileSize, xdif / 10 * 0.8, ydif / 10 * 0.8,
							this.dmg, this.rotation));
					this.recharge = 20;
					play('turret_shoot', 0.5);
				}
			}
			this.start = this.rotation;
			return true;
		}
	} else
		this.headTo();
};

Player.prototype.headTo = function() {
	var p = this.path.length - 1;
	var angle = this.path.length > 0 ? getAngle(this.prev.length == 0 ? [
			this.x, this.y ] : times(this.prev, tileSize), times(this.path[p],
			tileSize)) : -1;
	if (angle < 0)
		return;
	if (this.turn(angle)) {
		var mx = Math.cos(val(this.rotation - 90) / 180 * Math.PI);
		var my = Math.sin(val(this.rotation - 90) / 180 * Math.PI);
		mx = Math.round(mx, 2);
		my = Math.round(my, 2);
		this.x += mx * this.speed;
		this.y += my * this.speed;
		if (this.reachedDest(this.path[p])) {
			this.prev = this.path[p];
			this.x = this.prev[0] * tileSize;
			this.y = this.prev[1] * tileSize;
			this.path.splice(this.path.length - 1, 1);
		}
	}
};
// Player.prototype.reachedDest = function(path) {
// path[0] *= tileSize;
// path[1] *= tileSize;
// var facing = this.getFacing();
// var rot = val(this.rotation);
// var left = Math.abs(rot - 270) < 5;
// var up = Math.abs(rot - 180) < 5;
// var right = Math.abs(rot - 90) < 5;
// var down = Math.abs(rot) < 5;
// var xdist = (path[0] + (!left ? 31 : 0)) - facing[0];
// var ydist = (path[1] + (!down ? 31 : 0)) - facing[1];
// xdist = Math.round(xdist, 0);
// ydist = Math.round(ydist, 0);
// var xd = Math.abs(xdist);
// var yd = Math.abs(ydist);
// path[0] /= tileSize;
// path[1] /= tileSize;
// var mx = this.speed
// * Math.round(Math.cos(val(this.rotation - 90) / 180 * Math.PI), 2);
// var my = this.speed
// * Math.round(Math.sin(val(this.rotation - 90) / 180 * Math.PI), 2);
// if (right && (xdist < 0 || (xdist > 0 && xd < Math.abs(mx))))
// return true;
// else if (left && (xdist > 0 || (xdist < 0 && xd < Math.abs(mx))))
// return true;
// if (down && (ydist > 0 || (ydist < 0 && yd < Math.abs(my))))
// return true;
// else if (up && (ydist < 0 || (ydist > 0 && yd < Math.abs(my))))
// return true;
// return false;
// };

Player.prototype.reachedDest = function(path) {
	var mx = Math.cos((this.rotation - 90) / 180 * Math.PI);
	var my = Math.sin((this.rotation - 90) / 180 * Math.PI);
	var x = Math.round(this.x + tileSize / 2);
	var y = Math.round(this.y + tileSize / 2);
	var xDest = path[0] * tileSize + tileSize / 2;
	var yDest = path[1] * tileSize + tileSize / 2;
	return (mx < 0 ? x - 1 <= xDest : x + 1 >= xDest)
			&& (my < 0 ? y - 1 <= yDest : y + 1 >= yDest);
}
// Player.prototype.getFacing = function() {
// return [
// this.x + tileSize / 2
// + Math.cos(val(this.rotation - 90) / 180 * Math.PI)
// * tileSize / 2,
// this.y + tileSize / 2
// + Math.sin(val(this.rotation - 90) / 180 * Math.PI)
// * tileSize / 2 ];
// };
Player.prototype.draw = function() {
	var img = images[sEnt + 1];
	ctx.lineWidth = 1;
	ctx.fillStyle = "#000000";
	ctx.strokeStyle = "#000000";
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.translate(tileSize / 2, tileSize / 2);
	ctx.rotate(this.rotation / 180.0 * Math.PI);
	ctx.translate(-tileSize / 2, -tileSize / 2);
	ctx.drawImage(img, 0, 0);
	ctx.restore();
	ctx.beginPath();
	ctx.arc(this.x + tileSize / 2, this.y + tileSize / 2, this.range, 0,
			2 * Math.PI);
	ctx.stroke();
	ctx.beginPath();
	ctx.fillStyle = "#FF0000";
	ctx.arc(this.x + tileSize / 2, this.y + tileSize / 2, this.range * 1.2, 0,
			2 * Math.PI);
	ctx.stroke();
	ctx.fillStyle = "#FFFFFF";
};
Player.prototype.damage = function(amount) {
	if (Number.isNaN(amount))
		amount = 0.01;
	amount = Math.round(amount, 2);
	if (amount < 0.01)
		amount = 0.01;
	if (amount >= this.health) {
		gameOver = true;
		this.dead = true;
		return;
	}
	this.health -= amount;
};
// Player.prototype.turn = function(angle) {
// console.log(this.rotation + " " + angle);
// angle = val(angle);
// this.rotation = val(this.rotation);
// var a = angle - this.rotation;
// a = Math.abs((a + 180) % 360) - 180;
// if (Math.abs(a) > 5) {
// this.rotation += (a < 0 ? -1 : 1) * this.rotationSpeed;
// return false;
// }
// this.rotation = angle;
// return true;
// };
Player.prototype.turn = function(angle) {
	this.rotation = fix(this.rotation);
	angle = fix(angle);
	if (angle == this.rotation)
		return true;
	var goesLeft = this.rotation > angle ? this.rotation - angle > 360
			- this.rotation + angle : angle - this.rotation < 360 - angle
			+ this.rotation;
	if (goesLeft) {
		this.rotation += this.rotationSpeed;
		var stillLeft = this.rotation > angle ? this.rotation - angle > 360
				- this.rotation + angle : angle - this.rotation < 360 - angle
				+ this.rotation;
		if (!stillLeft) {
			this.rotation = angle;
			return true;
		}
	} else {
		this.rotation -= this.rotationSpeed;
		var left = this.rotation > angle ? this.rotation - angle > 360
				- this.rotation + angle : angle - this.rotation < 360 - angle
				+ this.rotation;
		if (left) {
			this.rotation = angle;
			return true;
		}
	}
	return false;
};

// Other objects
function Point(x, y) {
	this.x = x;
	this.y = y;
};