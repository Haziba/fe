var InputHandler = {
	Initialise: function(canvas){
		var me = this;
		
		this.mousePosition = {x: 0, y: 0};
		
		canvas.addEventListener("mousedown", function(e){
			me.mouseDown = true;
		});
		 
		canvas.addEventListener("mouseup", function(e){
			me.mouseDown = false;
		});
		 
		canvas.addEventListener("mousemove", function(e){
			me.mousePosition = {x: e.offsetX, y: e.offsetY};
		});
	 
		canvas.addEventListener("touchstart", function(e){
			me.mouseDown = true;
			me.mousePosition = {x: e.touches[0].pageX, y: e.touches[0].pageY};
	 
			e.preventDefault();
		});
	 
		canvas.addEventListener("touchend", function(e){
			me.mouseDown = false;
			me.mousePosition = {x: e.touches[0].pageX, y: e.touches[0].pageY};
	 
			e.preventDefault();
		});
	 
		canvas.addEventListener("touchmove", function(e){
			me.mousePosition = {x: e.touches[0].pageX, y: e.touches[0].pageY};
	 
			e.preventDefault();
		});
	},
     
    Update: function(){
        this.prevMouseDown = this.mouseDown;
    },
 
    MouseDown: function(){
        return this.mouseDown;
    },
     
    MouseClicked: function(){
        return this.mouseDown && !this.prevMouseDown;
    },
     
    MouseReleased: function(){
        return !this.mouseDown && this.prevMouseDown;
    },
     
    MousePosition: function(){
        return this.mousePosition;
    }
}