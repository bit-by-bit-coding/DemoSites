
const wordbankid = "wordbank";


const FILLABLE_CONSUMED_CLASS = "consumed";
const FILLABLE_CLASS = "fillable";
function isElement(element) {
	// https://www.w3schools.com/jsref/prop_node_nodetype.asp
	return element.nodeType == 1;
	// return element instanceof Element || element instanceof HTMLDocument;
}
function isText(element) {
	// https://www.w3schools.com/jsref/prop_node_nodetype.asp
	return element.nodeType == 3;
}

function allowDrop(ev) {
	if (isFillable(ev.target) && ! fromWordbank(ev.target.parentNode)) {
		ev.preventDefault();
	}
}

function drag(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
}

function fromWordbank(element) {
	return element.parentNode.id == wordbankid
}
function dropAppend(ev) {
	ev.preventDefault();
	// https://stackoverflow.com/questions/17368913/drag-drop-with-nested-target-in-html5#17369436
	ev.stopPropagation();
	//un-consume the source container if it was consumed
	let oldelementid = ev.dataTransfer.getData("text");
	let oldparentelement = document.getElementById(oldelementid).parentNode
	unConsume(oldparentelement)

	var data = ev.dataTransfer.getData("text");
	let draggedElement = document.getElementById(data)
	if (fromWordbank(draggedElement)) {
		draggedElement = draggedElement.cloneNode(true);
		draggedElement.id = nextUniqueId(draggedElement.id);
	}
	ev.target.appendChild(draggedElement);
}

function dropConsume(ev) {
	dropAppend(ev)

	consume(ev.target)
}


function consume(fillable) {
	fillable.removeAttribute("ondragover");// ensure nothing else can be dropped here
	fillable.classList.add(FILLABLE_CONSUMED_CLASS) //style it to look "consumed"
}

function unConsume(fillable) {
	if (isConsumed(fillable)) {
		fillable.classList.remove(FILLABLE_CONSUMED_CLASS)
		fillable.setAttribute("ondragover", "allowDrop(event)")
	}
}

function isConsumed(fillable) {
	return fillable.classList.contains(FILLABLE_CONSUMED_CLASS);
}

function isFillable(element) {
	return element.classList.contains(FILLABLE_CLASS)
}

function nextUniqueId(prefix = "") {
	var newId = ""

	if ((index = prefix.search(/\d/)) == -1) {
		//if theres no numbers in the id, add one
		let random = prefix + 0;

		//keep incrementig the id number until you find one that isnt in use
		while (document.getElementById(random)) {
			random = nextUniqueId(random);
		}

		newId = random

	} else {
		//if there are numbers in the id
		idNumber = parseInt(prefix.slice(index))

		newId = prefix.slice(0, index) + ++idNumber;
	}
	return newId
}

function trash(ev) {
	ev.preventDefault();
	//un-consume the source container if it was consumed
	let oldelementid = ev.dataTransfer.getData("text");
	let oldparentelement = document.getElementById(oldelementid).parentNode
	unConsume(oldparentelement)
	var data = ev.dataTransfer.getData("text");
	var element = document.getElementById(data);
	if (!fromWordbank(element)) {
		element.remove();
	}

}

function generateFillable() {
	fillable = document.createElement("span")
	fillable.classList.add(FILLABLE_CLASS);
	fillable.setAttribute("ondrop", "dropConsume(event)");
	fillable.setAttribute("ondragover", "allowDrop(event)");
		fillable.id = nextUniqueId("fillable");
	// fillable.innerText = "input1"
	return fillable
}

function filterOutTextNodes(nodeList) {
	let nodesClone = Array.from(nodeList).slice();
	for (node of nodesClone){
		if (isText(node)) {
			//at the position of the node, remove one node
			nodesClone.splice(nodesClone.indexOf(node), 1);
		}
	}
	return nodesClone
}

function evaluate(draggable) {
	if (isFillable(draggable)) {
		draggable = getDraggableFromFillable(draggable)
	}
	if (!isFullyFilled(draggable)) {
		alert("please fill in all parts of the boolean statement")
		return undefined;
	}

	let children = filterOutTextNodes(draggable.childNodes)
	let verdict = false;

	switch (draggable.dataset.booleanOp) {
		case "and":
			verdict = evaluate(children[0].childNodes[0]) && evaluate(children[1]);
			break;
		case "or":
			verdict = (evaluate(children[0]) || evaluate(children[1]));
			break;
		case "not":
			verdict =  !evaluate(children[0])
			break;
		case "equals":
			verdict =  evaluate(children[0]) == evaluate(children[1]);
			break;
		case "not-equals":
			verdict =  evaluate(children[0]) != evaluate(children[1]);
			break;
		case "value":
		case "true":
		case "false":
			verdict = getValueOfValueDraggable(draggable);
			break;
		default:
			console.error("boolean op not found")
			break;
	}
	setEvaluationStyle(draggable, verdict)
	return verdict
}

function setEvaluationStyle(draggable, style){
	if (isFillable(draggable)) {
		draggable = getDraggableFromFillable(draggable)
	}
	//reset true or false classes
	draggable.classList.remove("true")
	draggable.classList.remove("false")
	//set new class
	draggable.classList.add(String(style))
}

function getValueOfValueDraggable(draggable) {
	if (isFillable(draggable)) {
		draggable = getDraggableFromFillable(draggable)
	}

	let booleanOp = draggable.dataset.booleanOp;

	if (booleanOp === "value" && draggable.dataset.valueSource === "self") {
		return draggable.getElementsByTagName("input")[0].value
	} else if (booleanOp === "value") {
		return document.getElementById(draggable.dataset.valueSource).value
	} else if (booleanOp === "true"){
		return true;
	} else if(booleanOp === "false") {
		return false;
	} else {
		//not a valid value draggable
		return undefined;
	}
}

function isFilled(draggable) {
	if (isFillable(draggable)) {
		draggable = getDraggableFromFillable(draggable)
	}

	fillables = filterOutTextNodes(draggable.childNodes)
	for (fillable of fillables) {
		if (isFillable(fillable) && !isConsumed(fillable)) {
			return false
		}
	}
	return true
}

function getDraggableFromFillable(fillable) {
	return fillable.childNodes[0]
}

function isFullyFilled(draggable) {
	//if draggable is undefined (i.e. its parenthas no children) then something is not filled in
	if (!draggable) return false;

	//if a fillable is passed in, convert it to a draggable
	if (isFillable(draggable)) {
		draggable = getDraggableFromFillable(draggable)
	}

	if (draggable.dataset.booleanOp === "value") return true;

	var fillables = filterOutTextNodes(draggable.childNodes)

	if (parseInt(draggable.dataset.inputsCount) === 0) {
		return true;

	} else if (parseInt(draggable.dataset.inputsCount) === 1) { 
		return isFullyFilled(fillables[0])
	} else {
		return isFullyFilled(fillables[0]) && isFullyFilled(fillables[1])
	}

}	

// ##     ##    ###    #### ##    ## 
// ###   ###   ## ##    ##  ###   ## 
// #### ####  ##   ##   ##  ####  ## 
// ## ### ## ##     ##  ##  ## ## ## 
// ##     ## #########  ##  ##  #### 
// ##     ## ##     ##  ##  ##   ### 
// ##     ## ##     ## #### ##    ## 
//https://www.coolgenerator.com/ascii-text-generator using banner3

wordbank = document.getElementById(wordbankid)

//generate contents for each operator

for (word of wordbank.childNodes) {
	if (isElement(word)) {
		//assume that each word bank node only has text inside it
		text = word.childNodes[0]

		switch (parseInt(word.dataset.inputsCount)) {
			case 2:
				//insert one fillable on either side of the text
				word.insertBefore(generateFillable(), text);
				word.appendChild(generateFillable());
				break;
			case 1:
				//so far we only have not (!) so just assume we insert the single fillable after the text
				word.appendChild(generateFillable());
				break;
			default:
				//dont add any inputs
				break;
		}
	}
}
for (child of document.getElementById("inputs").childNodes) {
	// <span class="draggable" draggable="true" ondragstart="drag(event)" data-boolean-op="input1-equals" id="input1-equals">input1 equals [ text ]</span>
	if (isElement(child)) {
		draggable = document.createElement("span")
		draggable.classList.add('draggable');
		draggable.classList.add('noparens');
		draggable.draggable = true;
		draggable.setAttribute("ondragstart", "drag(event)");
		let inputid = child.getElementsByTagName("input")[0].id
		let draggableid = inputid + "-value"
		draggable.dataset.booleanOp = "value";
		draggable.dataset.valueSource = inputid;
		draggable.id = draggableid;
		draggable.innerText = "input1"

		wordbank.appendChild(draggable);
	}

}
