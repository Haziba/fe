var Collisions = {
	PointInRectangle: function(point, x, y, width, height){
		if(arguments.length == 2){
			y = x.y;
			width = x.width;
			height = x.height;
			x = x.x;
		}
		
		if(point.x < x)
			return false;
		if(point.x > x + width)
			return false;
		if(point.y < y)
			return false;
		if(point.y > y + height)
			return false;
		
		return true;
	},
	PointInCircle: function(point, x, y, radius){
		var distanceSq = Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2);
		var radiusSq = Math.pow(radius, 2);

		return distanceSq <= radiusSq;
	}
}