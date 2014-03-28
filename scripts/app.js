'use strict'

var Button = function(color, audioPath, index){
	var self = this;

	self.index = index;
	
	var actionClickListeners = [];
	var element = document.getElementById(color);

	var sound = new Audio(audioPath);
	sound.load();

	/* public methods */

	/* private methods */

	self.executeSound = function(){
		sound.play();
	};

	self.active = function(){
		element.className += " btn-active"
	};

	self.desactive = function(){
		element.className = element.className.replace("btn-active", "")
	};

	self.addListenerActionClick = function(listener){
		actionClickListeners.push(listener);
	};

	self.actionClick = function(){
		self.executeSound();
		actionClickListeners.forEach(function(listener){ listener.call(this, self) });
	};
};

var Game = function(songs, $scp){
	var self = this;
	
	self.isComputer = false;
	self.btnInitShow = true;
	self.statusText = "";

	var sequence = [];
	var bufferSequenceOfUser = [];

	songs.forEach(function(song){
		var isCorrect = true;
		var isNextComputer = false;

		song.addListenerActionClick(function(btnSong){
			isCorrect = true;
			isNextComputer = false;

			bufferSequenceOfUser.push(btnSong.index);
			
			bufferSequenceOfUser.forEach(function(songIndex, i){ 
				if (!(songIndex === sequence[i])){
					isCorrect = false;
					return;
				} 
				if(i === sequence.length - 1){
					isNextComputer = true;
				}
			});

			if(isCorrect){
				if(isNextComputer){
					bufferSequenceOfUser = [];
					setTimeout(function(){ 
						$scp.$apply(function () {
			        executeSequence();
			      });
					}, 2000);
				}
			}else{
				restartGame();
			}
		});
	});

	var restartGame = function(){
		self.btnInitShow = true;
		self.statusText = "Acabou o jogo, voce errou essa. =( Mas acertou " + (sequence.length - 1) + " sequencias.";
		sequence = [];
		bufferSequenceOfUser = [];
	};

	var getRandomValue = function(){
		 return Math.floor(Math.random() * 3);
	};

	var updateGameStatus = function(isComputer){
		self.isComputer = isComputer;
		self.statusText = self.isComputer ? "Nossa vez." : "Sua vez."
	};

	var executeSequence = function(){
		updateGameStatus(true);

		sequence.push(getRandomValue());

		sequence.forEach(function(value, index){
			setTimeout(function(){ 
				$scp.$apply(function () {
	        executeSong(value, index, sequence.length - 1) 
	      });
			}, index * 1000);
		});
	};

	var executeSong = function(value, currentIndex, maxIndex){
		var song = songs[value];
		song.active();
		setTimeout(function(){ song.desactive() }, 300);
		song.executeSound();

		if(maxIndex === currentIndex){
			setTimeout(function(){ 
				$scp.$apply(function () {
	        updateGameStatus(false);
	      });
			}, 1000);
		}
	};

	self.init = function(){
		executeSequence();
		self.btnInitShow = false;
	};

};


angular.module('genius', []).controller('geniusController', function($scope) {
	var $scp = $scope;

	$scp.btnBlue = new Button('blue', 'http://www.soundjig.com/mp3/soundfx/human/mmmhhh.mp3?', 0);
	$scp.btnRed = new Button('red', 'http://www.soundjig.com/mp3/soundfx/human/no.mp3?', 1);
	$scp.btnGreen = new Button('green', 'http://www.soundjig.com/mp3/soundfx/human/ok.mp3?', 2);
	$scp.btnYellow = new Button('yellow', 'http://www.soundjig.com/mp3/soundfx/human/yes.mp3?', 3);

	var songs = [$scp.btnBlue, $scp.btnRed, $scp.btnGreen, $scp.btnYellow];

	$scp.game = new Game(songs, $scp);

});