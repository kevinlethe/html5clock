
const NumberFormat = {
		NONE: 1,
		CARDINAL: 2,
		ALL: 4,
		ROMAN: 8,
		SHOW24: 16
	}
	
class Clock {
	drawface(numberFormat) {
		this.context.beginPath();
		this.context.arc(0, 0, this.radius, 0, 2 * Math.PI, false);
		this.context.fillStyle = this.faceColor;
		this.context.fill();
		this.context.lineWidth = 2;
		this.context.strokeStyle = 'black';
		this.context.stroke();
		for (var i = 0; i < 360; i += 6) {
			var width = i % 5 == 0 ? 2 : .5;
			this.lineToEdge(this.radius * .92, i, 'black', width);
		}
		//Fancy face for ROMAN
		if (numberFormat & NumberFormat.ROMAN) {
			this.context.beginPath();
			this.context.arc(0, 0, this.radius * .92, 0, 2 * Math.PI, false);
			this.context.stroke();
			for (var i = 0; i < 360; i += 30) {
				//var width = i % 5 == 0 ? 2 : .5;
				this.drawTriangle(i, 2, this.radius * .92, 1);
			}
		}

		if (!(numberFormat & NumberFormat.NONE)) {
			//Clock will be rotated 90° for drawing hands, but can't be done for the numbers
			//or they will be at the wrong angle.  This will draw the numbers in the correct
			//places starting at 'east'
			var arabicDigits = ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "13", "14"];
			var arabicDigits24 = ["6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "1", "2", "3", "4", "5", ];
			var romanDigits = ["III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "I", "II"];
			var digits = (numberFormat & NumberFormat.ROMAN) ? romanDigits : arabicDigits;
			if (this.is24) {
				digits = arabicDigits24;
			}
			this.context.fillStyle = 'black';
			this.context.textAlign = 'center';
			this.context.textBaseline = 'middle';
			var fontSize = (this.radius / 100) * 12;
			this.context.font = "bold " + fontSize + "px sans-serif";
			var totalDigits = this.is24 ? 24 : 12;
			for (var i = 0; i < totalDigits; i++) {
				if ((numberFormat & NumberFormat.ALL) | (i % 3 == 0)) {
					var radians = this.degreesToRadians(i * 30);
					if (this.is24) {
						radians = radians / 2;
					}
					this.context.fillText(digits[i], this.radius * .8 * Math.cos(radians), this.radius * 0.8 * Math.sin(radians));
				}
			}
			this.context.fillStyle = 'red';
			fontSize = (this.radius / 100) * 10;
			this.context.font = "bold " + fontSize + "px sans-serif";
			if (!this.is24 && numberFormat & NumberFormat.SHOW24) {
				for (var i = 12; i < 24; i++) {
					if ((numberFormat & NumberFormat.ALL) | (i % 3 == 0)) {
						this.context.fillText(arabicDigits[i], this.radius * .65 * Math.cos(this.degreesToRadians(i * 30)), this.radius * 0.65 * Math.sin(this.degreesToRadians(i * 30)));
					}
				}
			}
		}
	}

	clearFace() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.putImageData(this.face, 0, 0);
	}

	hand(type, value) {
		var color;
		var length;
		var width;
		switch (type) {
		case this.HandType.SECOND:
			color = 'red';
			length = this.radius * .9;
			width = 1;
			break;
		case this.HandType.MINUTE:
			length = this.radius * .89;
			width = 2;
			color = 'black';
			break;
		case this.HandType.HOUR:
			length = this.radius * .6;
			width = 4;
			color = 'black';
			break;
		}
		this.lineAtAngle(length, value, color, width, this.radius * -.1);
	}

	//Draws a line of given length and angle from offset, through center and outward
	lineAtAngle(length, angle, color, width, offset) {
		var radians = this.degreesToRadians(angle);
		this.drawLine(
			offset * Math.cos(radians),
			offset * Math.sin(radians),
			length * Math.cos(radians),
			length * Math.sin(radians),
			color,
			width);
	}

	//Draws a line of given length and angle from parimeter of circle inward
	lineToEdge(length, angle, color, width) {
		var radians = this.degreesToRadians(angle);
		this.drawLine(
			length * Math.cos(radians),
			length * Math.sin(radians),
			this.radius * Math.cos(radians),
			this.radius * Math.sin(radians),
			color,
			width);
	}

	drawLine(startX, startY, endX, endY, color, width) {
		this.context.beginPath();
		this.context.moveTo(startX, startY);
		this.context.lineTo(endX, endY);
		this.context.strokeStyle = color;
		this.context.lineWidth = width;
		this.context.stroke();
	}

	utcHand(angle) {
		this.drawTriangle(angle, 2, this.radius, 1.1);
	}
	
	drawTriangle(angle, sideAngle, start, distance) {
		var radians = this.degreesToRadians(angle);
		var length = this.radius * distance;
		var triangleAngle = this.degreesToRadians(sideAngle);
		var x = start * Math.cos(radians);
		var y = start * Math.sin(radians);
		if (distance < 0) {
			x = x * -1;
			y = y * -1;
		}
		this.context.beginPath();
		this.context.moveTo(x, y);
		this.context.lineTo(length * Math.cos(radians - triangleAngle), length * Math.sin(radians - triangleAngle));
		this.context.lineTo(length * Math.cos(radians + triangleAngle), length * Math.sin(radians + triangleAngle));
		this.context.fillStyle = 'black';
		this.context.fill();
	}

	drawHands(self) {
		var d = new Date();
		var ms = d.getMilliseconds();
		var s = d.getSeconds();
		var m = d.getMinutes();
		var h = d.getHours();
		var u = d.getUTCHours();
		self.clearFace();
		self.hand(self.HandType.HOUR, self.hourToAngle(h, m));
		self.hand(self.HandType.MINUTE, self.minuteToAngle(m, s));
		if (self.showSeconds) {
			self.hand(self.HandType.SECOND, self.secondsToAngle(s, ms));
		}
		if (self.showUtc) {
			self.utcHand(self.hourToAngle(u, m));
		}
	}

	hourToAngle(hours, minutes) {
		var angle = .5 * (60.0 * hours + minutes);
		if (this.is24) {
			angle = angle / 2;
		}
		return angle;
	}

	minuteToAngle(minutes, seconds) {
		return .1 * (60.0 * minutes + seconds);
	}

	secondsToAngle(seconds, milliseconds) {
		return .006 * (seconds * 1000.0 + milliseconds);
	}

	degreesToRadians(angle) {
		return Math.PI * angle / 180.0
	}

	constructor(tag, radius, numberFormat, is24, canvasColor, faceColor) {
		this.HandType = {
			SECOND: 0,
			MINUTE: 1,
			HOUR: 2,
			UTC: 3
		}
		
		this.showUtc = false;
		this.showSeconds = true;
		this.numberFormat = numberFormat;
		this.is24 = is24;
		
		this.radius = radius;
		var el = document.getElementById(tag);
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.radius * 2 * 1.2;
		this.canvas.height = this.radius * 2 * 1.2;
		this.canvas.style.backgroundColor = canvasColor || 'white';
		this.faceColor = faceColor || 'white';
		el.appendChild(this.canvas);

		this.context = this.canvas.getContext('2d');
		var centerX = this.canvas.width / 2;
		var centerY = this.canvas.height / 2;

		this.context.translate(centerX, centerY);
		this.drawface(this.numberFormat);
		//rotate 90° counter-clockwise to account for canvas starting direction being 'east'
		this.context.rotate(this.degreesToRadians(-90));
		this.face = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
	}

	start() {
		var self = this;
		setInterval(function () {
			self.drawHands(self)
		}, 10);
	}

}
