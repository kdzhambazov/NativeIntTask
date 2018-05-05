(function(){ //data table module

	var Grid = function(tableDom){ //data table functional constructor / class
		this.tableDom = tableDom;
		this.columns = new Array(); //table columns array
		this.data = new Array(); //data received from the XMLHttp request
		this.sortOrder = null; //sort order flag
	}

	Grid.prototype.populateTableData = function() { //make request to the server, if the server return status 200(success) populate the grid object and draw the table
		var that = this;
		var xhr = new XMLHttpRequest();				
		xhr.open('GET', 'http://cn.sbtech.com/sb-test/content.json');

		xhr.onload = function() {
		    if (xhr.status === 200) { //on success

		        var responseData = JSON.parse(xhr.response)
		        var i = 0;
		        var dataLength = responseData.length;

		        for (i = 0; i < dataLength; i++) {
		        	responseData[i].ID = parseInt(responseData[i].ID); //parse the ID field from string to integer for proper sorting
		        	that.data.push(responseData[i]); //fill the returned data in the grid object

					for(property in responseData[i]){ //fill the columns array with unique column names(objects in the returned JSON have different number and type properties)
						if(that.columns.indexOf(property) === -1){
							that.columns.push(property);
						}
					}
		        };

				table.renderHead(); //draw table head
				table.renderBody(); //draw table body

		    } else { console.log(xhr.status); } //on error
		};
		xhr.send();
	};

	Grid.prototype.sortTable = function(sortBy){ //sort table using native JS sort method
		this.tableDom.removeChild(document.querySelector("table#data-table tbody"));// clear table body before the sort

		if(this.sortOrder === null || this.sortOrder === 1) { //sort the table
			this.data.sort(function (a, b) {
				if(a[sortBy] > b[sortBy]){return 1;}
				if(a[sortBy] < b[sortBy]){return -1;}
				return 0;
			});
			this.sortOrder = 0;
		} else {
			this.data.reverse();
			this.sortOrder = 1;
		}

		this.renderBody(); //re-draw the table
	}

	Grid.prototype.renderHead = function(){ //render table head from the unique columns array
		var i;
		var colLength = this.columns.length;
		var th = this.tableDom.createTHead();
		var tr = document.createElement('tr');
    	var td = document.createElement('td');
    	var that = this;

		for (i = 0; i < colLength; i++) {
			td = document.createElement('td');
			td.appendChild(document.createTextNode(this.columns[i]));

			(function(sortBy){
				td.addEventListener('click', function(event) {
					that.sortTable(sortBy);
				});
			}(this.columns[i]))

			tr.appendChild(td);
		}

		th.appendChild(tr);
		this.tableDom.appendChild(th);
	}

	Grid.prototype.renderBody = function(){ //render table body
		var i, j;
		var dataLength = this.data.length;
		var colLength = this.columns.length;
		var key;
		var tb = document.createElement("tbody");
		var tr = document.createElement('tr');
    	var td = document.createElement('td');

	    for (i = 0; i < dataLength; i++) {
	    	tr = document.createElement('tr');

			for (j = 0; j < colLength; j++) {
				td = document.createElement('td');
				if(!this.data[i].hasOwnProperty(this.columns[j])){ //if the data object doen't have the unique column property we give it one with a defaul value
					this.data[i][this.columns[j]] = "";
				}
				td.appendChild(document.createTextNode(this.data[i][this.columns[j]]));
				tr.appendChild(td);
			}

			tb.appendChild(tr);
	    };

		this.tableDom.appendChild(tb);
	}

	var table = new Grid(document.getElementById("data-table"));
	table.populateTableData();
}());

(function(){ // dropdown and accordion events module

	var toggleDropdown = function(dropDomElems, dropType){ //dropdown functional contructor / class
		this.dropDomElems = dropDomElems;
		this.dropType = dropType;
	}

	toggleDropdown.prototype.setDropdownText = function(element, title){ //toggle 'Clock to open' / 'Click to close'
		if(this.dropType === "sidebar") { element.textContent = title};
	}

	toggleDropdown.prototype.addListeners = function(className){ //add 'Click' event listeners
		var i;
		var dropElemsLength = this.dropDomElems.length;
		var that = this;
		var classRemoveRegex = new RegExp('(\\s|^)' + className + '(\\s|$)');

		function handleDrops(){ // event lisneters callback function
			var flag = false;
			var activeDropElement = document.querySelectorAll("." + className);

			if(activeDropElement.length){
				if((" " + this.className + " ").replace(/[\n\t]/g, " ").indexOf(className) > -1){ flag = true; }

				activeDropElement[0].className = activeDropElement[0].className.replace(classRemoveRegex, ''); //remove all active classes
				that.setDropdownText(activeDropElement[0].querySelector(".drop-title"), "Click to open"); //toggle text if operating with the sidebar

				if(!flag){
						that.setDropdownText(this.querySelector(".drop-title"), "Click to close"); //toggle text if operating with the sidebar
						this.className += "  " + className; //add active class to the element 
				}
			} else {
				that.setDropdownText(this.querySelector(".drop-title"), "Click to close"); //toggle text if operating with the sidebar
				this.className += "  " + className; //add active class to the element 
			}
		};

		for(i = 0; i < dropElemsLength; i++){
			this.dropDomElems[i].addEventListener("click", handleDrops) //attach event listeners
		}
	}

	//Create objects, call object methods
	var navigation = new toggleDropdown(document.querySelectorAll("nav#top-nav ul li.top-level"), "nav");
	navigation.addListeners("nav-active");

	var accordion = new toggleDropdown(document.querySelectorAll("div#dropdowns .dropdown"), "sidebar");
	accordion.addListeners("dropdown-open");

}());