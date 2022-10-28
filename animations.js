var scrollUp = false;
var scrolling = false;
var oldScroll = false;
var scrollDir = 0;
const numSections = document.querySelectorAll('.viewport-container').length - 1;
// var sectionHeight = document.body.scrollHeight / (numSections + 1);
var sectionNum = 0;
var tick=0;
const scrollThreshold = 3;
const touchThreshold = 150;
var touchStartY = 0;
var touchEndY = 0;
var anim;
var postIts = document.querySelectorAll(".columns-block.post-block");
var quoteCards = document.getElementsByClassName("quote-card");
var isZoomed = false;
var heroSVG;
const scrollBehavior = 'smooth';

function wheelEvent(evt) {
	// console.log(evt);
	evt.preventDefault();
	evt.stopPropagation;
	evt.stopImmediatePropagation();
	if (isZoomed) {
		console.log("scroll prevented");
		return;
	}
	else if (scrolling==true) {
		console.log(evt);
		// controller.abort();
		return;
	}
	else {
		scrollUp = evt.deltaY > 0 ? false:true;
		if (oldScroll != scrollUp) {
			tick=0;
		}
		oldScroll = scrollUp;
		countTicks();
	}
}

function touchStartEvent(evt) {
	touchStartY = evt.touches[0].screenY;
}
function touchEndEvent(evt) {
	if (isZoomed) {
		console.log("scroll prevented!");
		return;
	}
	else {
		touchEndY = evt.changedTouches[0].screenY;
		touchDelta = touchStartY - touchEndY;
		// console.log("touch event: ", touchDelta);
		scrollUp = touchDelta > 0 ? false:true;
		console.log(touchDelta, scrollUp);
		if (Math.abs(touchDelta) > touchThreshold) {
			if (sectionNum > 0 && scrollUp || sectionNum < numSections && !scrollUp) {
				scrollToSection();
			}
		}
	}
}

function touchEvent(evt) {
	evt.preventDefault();
	evt.stopPropagation();
	evt.stopImmediatePropagation();
	console.log(evt);
	if (scrolling==true) {
		return;
	}
	scrollUp = evt.deltaY > 0 ? false:true;
	if (oldScroll != scrollUp) {
		tick=0;
	}
	oldScroll = scrollUp;
	countTicks();
}

function arrowEvent(evt) {
	if (isZoomed) {
		console.log("scroll prevented");
		return;
	}
	else if (["ArrowUp","ArrowDown"].indexOf(evt.code) > -1) {
		evt.preventDefault();
		evt.stopPropagation();
		evt.stopImmediatePropagation();
		scrollUp = evt.code == "ArrowUp" ? true:false;
		if (sectionNum > 0 && scrollUp || sectionNum < numSections && !scrollUp) {
			scrollToSection();
		}
	}
}

function countTicks() {
	if (!scrollUp && tick < scrollThreshold) {
		tick +=1;
	}
	else if (scrollUp && tick > -scrollThreshold) {
		tick -=1;
	}
	else if (Math.abs(tick) == scrollThreshold) {
		if ((!scrollUp && sectionNum < numSections) || (scrollUp && sectionNum > 0)) {
			scrollToSection();
		}
		else {
			tick = 0;
		}
	}
	console.log("tick: "+tick);
}

function scrollToSection() {
	console.log("Old Section: "+sectionNum);
	console.log("scroll height: " + this.scrollY);
	// window.requestAnimationFrame(stepScroll);
	// window.scrollTo(0,window.innerHeight*sectionNum);
	// tick=0;
	// scrolling=false;
	stepScroll2();
}

function scrollEvent(e) {
	evt.preventDefault();
	evt.stopImmediatePropagation();
	console.log("in scroll evt");
}

function stepScroll2() {
	// window.addEventListener("scroll", scrollEvent, false);
	if (scrolling) {
		console.log("scrolling blocked");
		return;
	}
	// window.removeEventListener("wheel", wheelEvent, { passive: false, capture: true, signal: controller.signal });
	scrolling = true;
	smoothScrollBy().catch((err)=> {
		console.error('failed to scroll to target');
		scrolling = false;
		// window.cancelAnimationFrame(anim);
		// stepScroll2();
	})
	.then( () => {
		scrolling = false;
	});
}

function resizeEvent(evt) {
	const targetPos = window.innerHeight * (sectionNum);
	// console.log(evt, window.innerHeight, targetPos);
	window.scrollTo({
		top: targetPos, left: 0, behavior: 'instant' 
	});
}

function smoothScrollBy() {
	return new Promise((resolve,reject) => {
		let same =0;
		let errorsFound = 0;
		let lastPos = window.scrollY;
		let dir = scrollUp ? -1:1;
		// let el = document.getElementById('section-'+parseInt(sectionNum+Math.sign(dir)));
		const targetPos = window.innerHeight*(sectionNum+Math.sign(dir));
	window.scrollTo({
		top: targetPos, left: 0, behavior: scrollBehavior 
		});
		anim=window.requestAnimationFrame(check);
		function check() {
			let newPos = window.scrollY;
			let at_dest = Math.abs(newPos - targetPos) <= 1;
			console.log(newPos, lastPos, at_dest, dir);
			if (newPos === lastPos) {
				if (same ++ > 2) {
					if (at_dest) {
						console.log("new scroll height: " + this.scrollY);
						sectionNum+=dir;
						console.log("New Section: "+sectionNum);
						tick = 0;
						return resolve();
					} else if (errorsFound < 10) {
						console.log("rejected", errorsFound);
						errorsFound ++;
					} else {
						return reject();
					}
				}
			}
			else {
				same = 0;
				lastPos = newPos;
			}
			window.requestAnimationFrame(check);
		}
	});
}

function stepScroll(timestamp) {
	let newPos = window.innerHeight*sectionNum;
	// window.scrollTo({
		// top: newPos,
		// behavior: 'smooth'
	// });
	window.scrollTo(0,newPos);
	if (this.scrollY != window.innerHeight*sectionNum) {
		console.log("scrollY during: " + this.scrollY);
		window.requestAnimationFrame(stepScroll);
	}
	else {
		console.log("scroll finished: " + this.scrollY);
		scrolling=false;
	}
}

function animateSections(dir) {
	var newSection = document.getElementById("section-"+sectionNum);
	var oldSection = dir ? document.getElementById("section-"+Number(sectionNum+1)) : document.getElementById("section-"+Number(sectionNum-1));
	console.log(newSection,oldSection);
	if (!dir) {
		newSection.classList.remove("moveFromTop");
		newSection.classList.remove("moveToTop");
		newSection.classList.remove("moveToBottom");
		oldSection.classList.remove("moveFromBottom");
		oldSection.classList.remove("moveFromTop");
		oldSection.classList.remove("moveToBottom");
		newSection.classList.add("moveFromBottom");
		oldSection.classList.add("moveToTop");
	}
	else {

		newSection.classList.remove("moveToTop");
		newSection.classList.remove("moveToBottom");
		newSection.classList.remove("moveFromBottom");
		oldSection.classList.remove("moveFromBottom");
		oldSection.classList.remove("moveToTop");
		oldSection.classList.remove("moveFromTop");
		newSection.classList.add("moveFromTop");
		oldSection.classList.add("moveToBottom");
	}
}

function noScroll(evt) {
	console.log("noscroll handler");
	evt.preventDefault();
	return;
}

function focusBox(evt){
	console.log("post-it clicked", evt.target);
	columnBlockEl = evt.target.closest('.columns-block')
	columnBlockEl.classList.add('focusedBox');
	for (let i=0; i<postIts.length; i++) {
		let thisEl = postIts[i];
		thisEl.classList.remove('resetLayout');
		thisEl.classList.remove('resetMiddleL');
		thisEl.classList.remove('resetMiddleR');
		thisEl.classList.remove('unfocus');
		// thisEl.classList.remove('unfocusRight');
		if (thisEl.id != columnBlockEl.id) {
			thisEl.classList.add('otherBox');
			if (thisEl.id.includes("code")) {
				if (columnBlockEl.id.includes("design")) {
					thisEl.classList.add('screenRight');
				}
				else {
					thisEl.classList.add('screenLeft');
				}
			}
		}
	}
	// thisEl.classList.add('big');
	// columnBlockEl.querySelector('.postIt-container').classList.remove('withHover');
	let polaroidEl = document.getElementsByClassName('polaroid-container '+columnBlockEl.id)[0];
	polaroidEl.classList.remove('fadeOutAnimated');
	polaroidEl.classList.add('fadeInAnimated');
	document.getElementById('section-1').addEventListener('click',resetView,true);
	// polaroids = document.getElementsByClassName('polaroid')
	polaroids = polaroidEl.querySelectorAll('.item');
	for (i=0; i<polaroids.length; i++) {
		polaroids[i].addEventListener('click', polaroidClick, false);
	}
}

function resetView(evt) {
	// console.log(evt.target.classList);
	if (evt.target.classList.contains("polaroid-container")) {
		evt.stopPropagation();
		document.getElementById('section-1').removeEventListener('click',resetView,true);
		console.log("section click", evt.target);
		polaroidEl = document.getElementsByClassName('fadeInAnimated')[0];
		polaroidEl.classList.remove('fadeInAnimated');
		polaroidEl.classList.add('fadeOutAnimated');
		polaroids = polaroidEl.children;
		for (i=0; i<polaroids.length; i++) {
			polaroids[i].removeEventListener('click', polaroidClick, false);
		}
		for (let i=0; i<postIts.length; i++) {
			let thisEl = postIts[i];
			if (thisEl.classList.contains('focusedBox')) {
				thisEl.classList.remove('focusedBox');
				// if (thisEl.classList.contains('column-left')) {
					// thisEl.classList.add('unfocusLeft');
				// }
				// else {
					// thisEl.classList.add('unfocusRight');
				// }
				thisEl.classList.add('unfocus');
				// thisEl.querySelector('.postIt-container').classList.add('withHover');
			}
			else {
				thisEl.classList.remove('otherBox');
				if (thisEl.classList.contains('screenLeft')) {
					thisEl.classList.remove('screenLeft');
					thisEl.classList.add('resetMiddleL');
				}
				else if (thisEl.classList.contains('screenRight')) {
					thisEl.classList.remove('screenRight');
					thisEl.classList.add('resetMiddleR');
				}
				else { thisEl.classList.add('resetLayout'); }
			}
			
		}
	}
}
function polaroidClick(evt) {
	//evt.stopPropagation();
	console.log("polaroid click", evt.currentTarget);
	isZoomed = true;
	let itemT = evt.currentTarget.offsetTop;
	let itemL = evt.currentTarget.offsetLeft;
	let itemW = evt.currentTarget.offsetWidth;
	let itemH = evt.currentTarget.offsetHeight;
	let itemCenterX = itemL + itemW / 2;
	let itemCenterY = itemT + itemH / 2;
	let iden = evt.currentTarget.classList[1]
	// let storyBoard = document.getElementsByClassName('storyBoard ' + iden)[0]
	let storyBoard = evt.currentTarget.parentElement.querySelector('.storyBoard.'+iden);
	console.log(itemCenterX,itemCenterY,storyBoard);
	document.documentElement.style.setProperty('--item-centerX', itemCenterX+'px');
	document.documentElement.style.setProperty('--item-centerY', itemCenterY+'px');
	storyBoard.classList.remove('unfocused');
	storyBoard.classList.add('focused');
	storyBoard.addEventListener('click',noStory,false);
}

function noStory(evt) {
	console.log("close story", evt);
	evt.currentTarget.classList.remove('focused');
	evt.currentTarget.classList.add('unfocused');
	evt.currentTarget.removeEventListener('click',noStory,false);
	isZoomed = false;
}

function testEvent(evt) {
	console.log(evt.target);
}

function rotateSign(evt) {
	// console.log(evt.target.id+'Sign');
	let oldSign = document.querySelectorAll('.sign.isVisible')[0];
	// oldSign = document.getElementById('mainSign');
	let signSelector = evt.target.id.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ')[0];
	let newSign = document.getElementById(signSelector + 'Sign');
	// console.log(oldSign, signSelector, newSign);
	heroSVG.querySelector('.'+signSelector+'.step').classList.add('clicked');
	oldSign.classList.remove('isVisible');
	newSign.classList.remove('isHidden');
	oldSign.classList.add('rotateOut');
	newSign.classList.add('rotateIn');
	oldSign.firstElementChild.addEventListener('animationend', signAnimated, false);
}

function signAnimated(evt) {
	let oldSign = document.getElementById('mainSign');
	let newSign = document.querySelectorAll('.sign.rotateIn')[0];
	let signSelector = newSign.id.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ')[0];
	heroSVG.querySelector('.'+signSelector+'.step').classList.remove('clicked');
	oldSign.classList.add('isVisible');
	newSign.classList.add('isHidden');
	oldSign.classList.remove('rotateOut');
	newSign.classList.remove('rotateIn');
	oldSign.firstElementChild.removeEventListener('animationend', signAnimated, false);
}

function loadedSVG (evt) {
	console.log('loaded svg');
	heroSVG = document.getElementById('edp').getSVGDocument();
	heroSVG.addEventListener("wheel", wheelEvent, {passive: false});
	heroSVG.getElementById('edpSVG').addEventListener('animationend', svgAnimated, false);
}

function svgAnimated (evt) {
	if (evt.target === evt.currentTarget) {
		console.log('svg animated', evt.target, evt.currentTarget);
		heroSVG.addEventListener("wheel", wheelEvent, {passive: false});
		heroSVG.addEventListener("keydown", arrowEvent, { passive: false });
		heroSVG.addEventListener("touchstart", touchStartEvent, { passive: true, capture: true});
		heroSVG.addEventListener("touchend", touchEndEvent, { passive: true, capture: true});
		var thisEl = heroSVG.getElementById('step1');
		thisEl.addEventListener('click', rotateSign, false);
		thisEl.classList.add('withHover');
		thisEl = heroSVG.getElementById('step2');
		thisEl.addEventListener('click', rotateSign, false);
		thisEl.classList.add('withHover');
		thisEl = heroSVG.getElementById('step3');
		thisEl.addEventListener('click', rotateSign, false);
		thisEl.classList.add('withHover');
		thisEl = heroSVG.getElementById('step4');
		thisEl.addEventListener('click', rotateSign, false);
		thisEl.classList.add('withHover');
		// let createArray = Array.from(heroSVG.querySelectorAll('.createGroup path'));
		// createArray.forEach(function (item) { 	item.addEventListener('click', rotateSign, false);
												// item.classList.add('withHover'); });
		// let commArray = Array.from(heroSVG.querySelectorAll('.communicateGroup path'));
		// commArray.forEach(function (item) { item.addEventListener('click', rotateSign, false); 
											// item.classList.add('withHover'); });
	}
	else {
		return;
	}
}

function addClickListeners() {
}

function newQuoteCard(evt) {
	//console.log(evt.target, evt.target.closest('.quote-card'));
	let thisCard = evt.target.closest('.quote-card');
	if (thisCard.classList.contains('top-card')) {
		let nextCard = thisCard.previousElementSibling;
		if (nextCard === null) {
			nextCard = thisCard.nextElementSibling;
		}
		nextCard.classList.remove('shuffled');
		thisCard.classList.add('shuffled');
		thisCard.classList.remove('top-card');
		thisCard.classList.add('bottom-card');
		nextCard.classList.remove('bottom-card');
		nextCard.classList.add('top-card');
	}
	//need to add class to top card to shift up and behind
	//add class to bottom card to change z index
	
}

// const controller = new AbortController();
document.getElementById('edp').addEventListener('load', loadedSVG, false);
window.addEventListener("wheel", wheelEvent, { passive: false });
// document.addEventListener('click', testEvent, false);
window.addEventListener("keydown", arrowEvent, { passive: false });
window.addEventListener("touchstart", touchStartEvent, false);
window.addEventListener("touchend", touchEndEvent, false);
window.addEventListener('resize', resizeEvent, false);


for (let i=0; i<postIts.length; i++) {
	postIts[i].addEventListener('click',focusBox,false);
	// console.log(postIts[i]);
}
for (let i=0; i<quoteCards.length; i++) {
	quoteCards[i].addEventListener('click',newQuoteCard,false);
}