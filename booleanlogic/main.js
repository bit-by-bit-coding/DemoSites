
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
	if (ev.target.classList.contains("fillable")) {
		ev.preventDefault();
	}
}

function drag(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
}

function fromWordbank(element) {
	return element.parentNode.id == "wordbank"
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


function consume(element) {
	element.removeAttribute("ondragover");// ensure nothing else can be dropped here
	element.classList.add("consumed") //style it to look "consumed"
}

function unConsume(element) {
	if (element.classList.contains("consumed")) {
		element.classList.remove("consumed")
		element.setAttribute("ondragover", "allowDrop(event)")
	}
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


// ##     ##    ###    #### ##    ## 
// ###   ###   ## ##    ##  ###   ## 
// #### ####  ##   ##   ##  ####  ## 
// ## ### ## ##     ##  ##  ## ## ## 
// ##     ## #########  ##  ##  #### 
// ##     ## ##     ##  ##  ##   ### 
// ##     ## ##     ## #### ##    ## 
//https://www.coolgenerator.com/ascii-text-generator using banner3

wordbank = document.getElementById("wordbank")
for (child of document.getElementById("inputs").childNodes) {
	// <span class="draggable" draggable="true" ondragstart="drag(event)" data-boolean-op="input1-equals" id="input1-equals">input1 equals [ text ]</span>
	if (isElement(child)) {
		draggable = document.createElement("span")
		draggable.classList.add('draggable');
		draggable.classList.add('noparens');
		draggable.draggable = true;
		draggable.setAttribute("ondragstart", "drag(event)");
		draggableid = child.getElementsByTagName("input")[0].id
		draggable.dataset.booleanOp = draggableid;
		draggable.id = draggableid;
		draggable.innerText = "input1"

		wordbank.appendChild(draggable);
	}

}
