var budgetController = (function() {
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current, index) {
            sum += current.value;
        })
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem;
            // ID = lastID + 1
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);                
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // push it into our data stucture
            console.log(data.allItems[type]);
            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            // id = 5
            // data.allItems[type]
            // ids = [1 2 4 5 6]
            // index = 3

            console.log(data.allItems[type]);
            

            var ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            console.log(index);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // calculate total incom and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate the budget: incom -expend
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of incom that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }


            // Expense = 100 and income 200, spent 50% = 100/200
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);            
        }
    }


})();

var UIController = (function() {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    }

    return {
        getInput: function() {
            return {
                type : document.querySelector(DOMstrings.inputType).value, // will be either inc or ex
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem : function(obj, type) {
            var html, newHTML, element;

            // Create HTMl string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = `<div class="item clearfix" id="inc-%id%">
                    <div class="item__description">%description%</div>
                    <div class="right clearfix">
                        <div class="item__value">%value%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`
            } else if (type='exp') {
                element = DOMstrings.expensesContainer;

                html = `<div class="item clearfix" id="exp-%id%">
                    <div class="item__description">%description%</div>
                    <div class="right clearfix">
                        <div class="item__value">%value%</div>
                        <div class="item__percentage">21%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`
            }

            console.log(obj);
            
            // Replace the placholder text with some actual data
            newHTML = html.replace('%id%', obj.id)
            newHTML = newHTML.replace('%description%', obj.description)
            newHTML = newHTML.replace('%value%', obj.value)

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, arr) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        getDOMstrings: function() {
            return DOMstrings
        }
    };
})();

// Global app controller
var controller = (function(budgetCtrl, UICtrl){
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress', function(e){
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }

        });

        document.querySelector(DOM.container).addEventListener('click', ctrDeleteItem)
    };

    var updateBudget = function() {
        // 1. calculate the budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        var budget = budgetCtrl.getBudget();

        // 3. display budget o the UI
        UICtrl.displayBudget(budget);        
    }

    var ctrlAddItem = function() {
        // 1. Get the field input data
        var input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
    
            // 4. clear field
            UICtrl.clearFields();
    
            // 5. Calculate and update budget
            updateBudget();             
        }
    
    };

    var ctrDeleteItem = function(event) {
        var itemID, splitID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            // inc-1 
            splitID = itemID.split('-');
            type = splitID[0];
            ID = splitID[1];            

            // 1. delete item from the data
            budgetCtrl.deleteItem(type,ID);

            // 2. delete the item from the UI

            // 3. update and show the new budget
        }
    };

    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();            
        }
    }
})(budgetController, UIController);

controller.init();