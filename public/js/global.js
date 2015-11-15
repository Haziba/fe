var Global = {
	canvas: undefined,
	screenSize: {width: 20, height: 15},
	LastId: 0,
	NewId: function(forDebugging)
	{
		if(forDebugging) {
			return Global.Names.splice(Math.floor(Math.random() * this.Names.length), 1)[0];
		}
		return this.LastId++;
	},
	QueryStringValue: function(name){
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	},
	TileSize: function(){
		return 40;
	},
	SetScreenSize: function(screenSize){
		this.screenSize = screenSize;
		
		var context = this.canvas.getContext("2d");
		
		context.width = this.canvas.width = this.TileSize() * this.ScreenSize().width;
		context.height = this.canvas.height = this.TileSize() * this.ScreenSize().height;
		
		$(this.canvas).css({
			width: this.TileSize() * this.ScreenSize().width,
			height: this.TileSize() * this.ScreenSize().height,
			"margin-left": -this.TileSize() * this.ScreenSize().width / 2,
			"margin-top": -this.TileSize() * this.ScreenSize().height / 2
		});
	},
	ScreenSize: function(){
		return this.screenSize;
	}
};

Global.Names = ['Ashlee',
'Luetta',
'Marg',
'Curtis',
'Raphael',
'Kallie',
'Elyse',
'Delbert',
'Tajuan',
'Keshi',
'Leath',
'Duane',
'Peter',
'Martina',
'Hien',
'Scot',
'Corina',
'Kathyrn',
'Lula',
'Bailey',
'Donna',
'Alfred',
'Jolynn',
'Elise',
'Tiffani',
'Alycia',
'Marian',
'Rayna',
'Williams',
'Nina',
'Livia',
'Nolan',
'Charlotte',
'Lynetta',
'Jennie',
'Terina',
'Darla',
'Helaine',
'Jarred',
'Nerissa',
'Conchita',
'Trenton',
'Earlie',
'Lorina',
'Lovetta',
'Felisa',
'Marilou',
'Armanda',
'Scott',
'Laura',
'Laverna',
'Katlyn',
'Dawn',
'Noriko',
'Heidi',
'Cheyenne',
'Clemmie',
'Vivien',
'Georgette',
'Jason',
'Jame',
'Peter',
'Marvella',
'Dirk',
'Tia',
'Delmer',
'Mittie',
'Kenna',
'Adeline',
'Letty',
'Myong',
'Sharlene',
'Fabian',
'Cheree',
'Mozella',
'Faustina',
'Rory',
'Marvin',
'Jennie',
'Margurite',
'Ricardo',
'Jewel',
'Tracy',
'Nigel',
'Dinorah',
'Krystin',
'Rosetta',
'Kathie',
'Hans',
'Una',
'Normand',
'Malcolm',
'Cuc',
'Alaine',
'Zaida',
'Gustavo',
'Denice',
'Brandy',
'Aletha',
'Ulrike'];