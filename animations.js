const DEBUG = true;
if (!DEBUG) {
	if(window.console) window.console = {};
	var methods = ["log", "debug", "warn", "info"];
	for (let i=0;i<methods.length;i++) {
		console[methods[i]] = function() {};
	}
}

var scrollUp = false;
var scrolling = false;
var oldScroll = false;
var scrollDir = 0;
const sections = document.querySelectorAll('.viewport-container');
const numSections = sections.length - 1;
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
// var navLinks = document.getElementsByClassName("section-heading withHover");
var navBlocks = document.querySelectorAll('.nav-block');
var navCells = document.querySelectorAll('div.section-heading.nav');
const navBar = document.getElementsByClassName('nav-row')[0];
// var initialNavBarOffset = document.getElementsByClassName('nav-row')[0].offsetWidth / 2;
const numBlocks = navBlocks.length;
const numCells = navCells.length;
const numHeadings = 5;
var cellWidth = navCells[0].offsetWidth;
var resetMenu = false;
const numQuoteCards = quoteCards.length;
var isZoomed = false;
var whyAnimated = false;
var heroSVG;
var valueSVG;
var compareSVG;
const scrollBehavior = 'smooth';

var customVH = window.innerHeight;
document.documentElement.style.setProperty('--viewport-height',customVH + 'px');

/* var ua = window.navigator.userAgent;
var iOS = (!!ua.match(/iPad/i) || !!ua.match(/iPhone/i));
var FF = !!ua.match("FxiOS");
var EDGE = !!ua.match("EdgiOS");
var CHROME = !!ua.match("CriOS");
var webkit = !!ua.match(/WebKit/i);
// var iOSSafari = iOS && webkit && (!CHROME && !FF && !EDGE);
var iOSSafari = true; */
const isFixed = true;

if (isFixed) {
	// alert(ua);
	document.body.classList.add('isFixed');
}

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
		console.log('wheel scrolling throttled');
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
	// evt.preventDefault();
	// evt.stopPropagation();
	// evt.stopImmediatePropagation();
	touchStartY = evt.touches[0].screenY;
}
function touchEndEvent(evt) {
	// evt.preventDefault();
				
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
	colorArrow();
}

function navClick(evt) {
	console.log(evt);
    let divContainer = evt.currentTarget;
    if (divContainer.classList.contains('current') || divContainer.classList.contains('hidden')) {
        console.log(divContainer.classList, 'passing');
        return;
    }
    console.log(divContainer.innerHTML);
    let centerCell = document.getElementsByClassName('current')[0];
    let centerIndex = centerCell.index;
	let newIndex = divContainer.index;
	console.log(centerIndex,newIndex);
    centerCell.classList.remove('current');
    let moveNum = centerIndex - newIndex;
    if (newIndex <= 1 || newIndex >= 13) {
        console.log('reorienting indices');
        centerIndex = ogCenterCellIndex;
		if (newIndex < 2) {
			newIndex = centerIndex + newIndex - 2;
		}
		else {
        	newIndex = centerIndex + newIndex - 12;
		}
		moveNum = centerIndex - newIndex;
        resetMenu = true;
    }
    console.log(centerIndex,newIndex);
    let endCell = centerIndex + 2;
    let startCell = centerIndex - 2;
    navCells[newIndex].classList.add('current');
	let navBarWidth = document.getElementsByClassName('nav-row')[0].offsetWidth;
    let currentTranslate = resetMenu ? -navBarWidth / 2 : new WebKitCSSMatrix(getComputedStyle(navBar).transform).m41;
    console.log(`currentTranslate:${currentTranslate}`)
    if (resetMenu) resetMenuEls();
    for (let i=0; i<Math.abs(moveNum); i++) {
        if (moveNum>0) {
            navCells[startCell-i-1].classList.remove('hidden');
            navCells[endCell-i].classList.add('hidden');
        }
        else {
            navCells[endCell+i+1].classList.remove('hidden');
            navCells[startCell+i].classList.add('hidden');
        }
    }
    
	let currentPos = navCells[centerIndex].offsetLeft + navCells[centerIndex].offsetWidth / 2;
	let newPos = navCells[newIndex].offsetLeft + navCells[newIndex].offsetWidth/2;
	let distance2travel = currentPos - newPos;
	console.log(`currentPos=${currentPos}, newPos=${newPos}, distance=${distance2travel}`);
	let totalTravelinPerecent = ((currentTranslate+distance2travel) / navBarWidth) * 100;
	navBar.style.transform = `translateX(${totalTravelinPerecent}%)`;
	// navBar.style.transform = `translateX(${currentTranslate+distance2travel}px)`;
	// let totalTravelinVW = ((currentTranslate+distance2travel) / window.innerWidth) * 100;
	// navBar.style.transform = `translateX(${totalTravelinVW}vw)`;
    console.log(navBar.style.transform);
	if (evt.isTrusted) {
		sectionJump(evt);
	}
	else console.log('programatic click');

}

function resetMenuEls() {
    for (let i=0; i<numCells; i++) {
        navCells[i].classList.add('hidden');
        if (i>=numHeadings && i<2*numHeadings) navCells[i].classList.remove('hidden');
    }
    resetMenu = false;
}

function colorArrow() {
	let arrows;
	if (tick == 0){
		arrows = document.querySelectorAll('.lgStop');
		arrowColor = "black";
	}
	else if (tick > 0) {
		arrows = document.querySelectorAll('.lgStop'+tick);
		arrowColor = 'red';
	}
	else {
		return;
	}
	console.log(arrows);
	for (let i = 0; i < arrows.length; i++) {
		arrows[i].style.stopColor = arrowColor;
		// arrows[i].attributes['stop-color'] = arrowColor;
	}
}

function buttonScroll(evt) {
	console.log(evt.currentTarget + " clicked");
	scrollUp = false;
	scrollToSection();
}

function sectionJump(evt) {
	let newSectionID = evt.currentTarget.innerHTML;
	//let thisSectionID = sections[sectionNum].id;
	//let targetPos;
	// console.log(sectionID);
	for (let i = 0; i<=numSections; i++) {
		if (sections[i].id == "section-" + newSectionID) {
			sectionNum = i;
			//targetPos = -customVH * sectionNum;
			break;
		}
	}
	//sections[sectionNum].getElementsByClassName('grid3row')[0].getElementsByClassName('header-row')[0].getElementsByClassName('center')[0].getElementsByClassName('section-heading')[0].innerHTML
	//document.body.style.setProperty('top', targetPos+'px');
	bodyHeightAdjust(false);
}

function scrollToSection() {
	console.log("Old Section: " + sectionNum);
	console.log("scroll height: " + this.scrollY);
	if (isFixed) {
		// alert("bodyadjust");
		bodyHeightAdjust();
	}
	else {
		stepScroll2();
	}
}

function bodyHeightAdjust(sectionNeedsUpdate = true) {
	scrolling = true;
	document.body.addEventListener('transitionend', function resumeScroll(evt) {
		if (evt.target==document.body){
			console.log('wheel scrolling permitted');
			scrolling=false;
			document.body.removeEventListener('transitionend', resumeScroll);
		}
	  }, false);
	console.log('adjusting body height');
	let targetPos;
	if (sectionNeedsUpdate) {
		let dir = scrollUp ? -1:1;
		targetPos = -customVH * (sectionNum+Math.sign(dir));
		sectionNum+=dir;
	}
	else {
		targetPos = -customVH * sectionNum;
	}
	document.body.style.setProperty('top', targetPos+'px');
	console.log("New Section: "+sectionNum);
	tick = 0;
	updateSection();
}

function updateSection() {
	let thisSection = document.getElementsByClassName("viewport-container")[sectionNum].id;
	let sectionName = thisSection.split('-')[1];
	console.log(sectionName);
	document.querySelectorAll('.'+sectionName+':not(.hidden')[0].click();
	if (sectionName == "what") {
		peelPostits();
	}
	else if (sectionName == "why") {
		if (!whyAnimated) {
			whyAnimated = true;
			animateValue();
		}
	}
}

function animateValue() {
	valueSVG = document.getElementById("valuePropSVG").getSVGDocument();
	compareSVG = document.getElementById("valueCompareSVG").getSVGDocument();
	valueSVG.addEventListener("wheel", wheelEvent, {passive: false});
	valueSVG.addEventListener("keydown", arrowEvent, { passive: false });
	valueSVG.addEventListener("touchstart", touchStartEvent, { passive: true, capture: true});
	valueSVG.addEventListener("touchend", touchEndEvent, { passive: true, capture: true});
	compareSVG.addEventListener("wheel", wheelEvent, {passive: false});
	compareSVG.addEventListener("keydown", arrowEvent, { passive: false });
	compareSVG.addEventListener("touchstart", touchStartEvent, { passive: true, capture: true});
	compareSVG.addEventListener("touchend", touchEndEvent, { passive: true, capture: true});
	valueSVG.getElementById('proposition-group').classList.add('animate');
	valueSVG.getElementById('captionProp').addEventListener('animationend', valueAnimated, false);
}

function valueAnimated(evt) {
	console.log('value animated',evt);
	evt.target.removeEventListener('animationend', valueAnimated, false);
	evt.target.classList.add('pulse');
	valueSVG.addEventListener('click', animateCompare, false);
}

function animateCompare(evt) {
	console.log("compare started");
	valueSVG.removeEventListener('click', animateCompare, false);
	let caption = valueSVG.getElementById('captionProp');
	caption.classList.add("pulsed");
	caption.classList.remove("pulse");
	caption.lastElementChild.innerHTML="";
	compareSVG.getElementById('comparison-group').classList.add('animate');
	let svgs = document.querySelectorAll('.customSVG');
	for (let i=0; i<svgs.length; i++) {
		svgs[i].classList.add('animate');
	}
	//compareSVG.getElementById('compareScribble').addEventListener('animationend', compareAnimated, false);
	// valueSVG.getElementById('proposition-group').classList.add('slide');
}

function compareAnimated(evt) {
	let svgs = document.querySelectorAll('.customSVG');
	for (let i=0; i<svgs.length; i++) {
		svgs[i].classList.add('animate');
	}
	console.log('compare finished');
}

function stepScroll2() {
	if (scrolling) {
		console.log("scrolling blocked");
		return;
	}
	scrolling = true;
	smoothScrollBy().catch((err)=> {
		console.error('failed to scroll to target');
		scrolling = false;
	})
	.then( () => {
		scrolling = false;
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

function resizeEvent(evt) {
	customVH = window.innerHeight;
	document.documentElement.style.setProperty('--viewport-height',customVH + 'px');
	const targetPos = -customVH * (sectionNum);
	document.body.style.setProperty('top', targetPos+'px');
/* 	let currentNavEl = document.getElementsByClassName('current')[0];
	let currentPos = currentNavEl.offsetLeft + currentNavEl.offsetWidth / 2;
	let screenCenter = window.innerWidth / 2;
	let distance2travel = currentPos - screenCenter;
	let currentTranslate = new WebKitCSSMatrix(getComputedStyle(navBar).transform).m41;
	let totalTravel = currentTranslate + distance2travel;
	navBar.style.transform = `translateX(${totalTravel}px)`;
	console.log(`current: ${currentTranslate}, travel: ${totalTravel}`); */

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
	document.getElementById('section-what').addEventListener('click',resetView,true);
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
		document.getElementById('section-what').removeEventListener('click',resetView,true);
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


function peelPostits() {
	let peeledEls = document.querySelectorAll('.folded.postIt');
	for (let i=0; i<peeledEls.length; i++) {
		let thisEl = peeledEls[i];
		if (thisEl.inTrans == true) {
			console.log(thisEl);
			// thisEl.classList.remove('sneakPeak');
			continue;
		}
		else {
			thisEl.classList.add('sneakPeak');
		}
	}
}

function zoomCard(evt) {
	let thisEl = evt.currentTarget;
	console.log("card click", thisEl);
	isZoomed = true;
	let dims = thisEl.getBoundingClientRect();
	let itemCenterX = dims.x + dims.width / 2;
	let itemCenterY = dims.y + dims.height / 2;
	console.log(itemCenterX, itemCenterY);
	let thisCard = document.querySelector('#'+thisEl.id+'-zoomed');
	console.log(itemCenterX,itemCenterY,thisCard);
	document.documentElement.style.setProperty('--item-centerX', itemCenterX+'px');
	document.documentElement.style.setProperty('--item-centerY', itemCenterY+'px');
	thisCard.classList.remove('unfocused');
	thisCard.classList.add('focused');
	thisCard.addEventListener('click',noStory,false);
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
		// alert('svganimated');
		console.log('svg animated', evt.target, evt.currentTarget);
		heroSVG.addEventListener("wheel", wheelEvent, {passive: false});
		heroSVG.addEventListener("keydown", arrowEvent, { passive: false });
		heroSVG.addEventListener("touchstart", touchStartEvent, { passive: true, capture: true});
		heroSVG.addEventListener("touchend", touchEndEvent, { passive: true, capture: true});
		var thisEl = heroSVG.getElementById('step1');
		// thisEl.addEventListener('click', rotateSign, false);
		thisEl.classList.add('withHover');
		thisEl = heroSVG.getElementById('step2');
		// thisEl.addEventListener('click', rotateSign, false);
		thisEl.classList.add('withHover');
		thisEl = heroSVG.getElementById('step3');
		// thisEl.addEventListener('click', rotateSign, false);
		thisEl.classList.add('withHover');
		thisEl = heroSVG.getElementById('step4');
		// thisEl.addEventListener('click', rotateSign, false);
		thisEl.classList.add('withHover');
	}
	else {
		return;
	}
}

function addClickListeners() {
}

function newQuoteCard(evt) {
	console.log(evt.target, evt.target.closest('.quote-card'));
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
}

function shuffleCards(evt) {
	let thisCard = evt.target.closest('.quote-card');
	let nextCard = thisCard.classList.contains('bottom-card') ? document.querySelector('.top-card') : thisCard.previousElementSibling;
	console.log(thisCard);
	thisCard.classList.add('shuffled');
	thisCard.removeEventListener('click',shuffleCards,false);
	nextCard.classList.remove('shuffled');
	nextCard.addEventListener('click',shuffleCards,false);
}

function nullEvent(evt) {
	evt.preventDefault();
	evt.stopPropagation;
	evt.stopImmediatePropagation();
}

// const controller = new AbortController();
document.getElementById('edp').addEventListener('load', loadedSVG, false);
window.addEventListener("wheel", wheelEvent, { passive: false });
// document.addEventListener('click', testEvent, false);
window.addEventListener("keydown", arrowEvent, { passive: false });
window.addEventListener("touchstart", touchStartEvent, { passive: false });
window.addEventListener("touchend", touchEndEvent, { passive: false });
// document.ontouchmove = function (e) { e.preventDefault(); }
// window.addEventListener("pointerMove", nullEvent, { [passive: false });
window.addEventListener('resize', resizeEvent, false);


for (let i=0; i<postIts.length; i++) {
	postIts[i].addEventListener('click',focusBox,false);
	let peeledEl = 	postIts[i].children[1].children[0];
	peeledEl.addEventListener('transitionstart', (evt) => {
		if (evt.pseudoElement === '') {
			if (peeledEl.classList.contains('sneakPeak')) {
				console.log('start', evt.propertyName);
				peeledEl.inTrans = true;
			}
		}
	  });
	peeledEl.addEventListener('transitionend', (evt) => {
		if (evt.pseudoElement === '') {
			if (peeledEl.classList.contains('sneakPeak')) {
				peeledEl.classList.remove('sneakPeak');
			}
			else {
				console.log('end', evt.propertyName);
				peeledEl.inTrans = false;
			}
		}
	  });
	peeledEl.addEventListener('transitioncancel', (evt) => {
		console.log(evt.target, 'transitioncancel fired');
	  });
}

/* for (let i=0; i<navLinks.length; i++) {
	navLinks[i].addEventListener('click', sectionJump, false);
} */
/* for (let i=0; i<quoteCards.length; i++) {
	quoteCards[i].addEventListener('click',newQuoteCard,false);
} */

for (let i=0; i<numQuoteCards; i++) {
	const cardX = 2;
	const cardY = 5;
	let thisCard=quoteCards[i];
	let xOffset = 50 + (i - (numQuoteCards - 1) / 2) * cardX;
	let yOffset = 50 + ((numQuoteCards - 1) / 2 - i) * cardY ;
	thisCard.setAttribute('id',"card-"+i);
	if (i==0) {
		thisCard.classList.add("bottom-card");
	}
	else if (i == numQuoteCards - 1) {
		thisCard.classList.add("top-card");
		thisCard.addEventListener('click',shuffleCards,false);
	}
	thisCard.style.left = xOffset + "%";
	thisCard.style.top = yOffset + "%";
}

for (let i = 0; i < numCells; i++) {
    navCells[i].style.gridColumn = String(i + 1);
    navCells[i].index = i;
    navCells[i].addEventListener('click', navClick, false);
    if (i<=(numHeadings-1) || i>(2*numHeadings -1)) {
        navCells[i].classList.add('hidden');
    }
}
const ogCenterCellIndex = document.getElementsByClassName('current')[0].index;
