// Populate meal calendar
document.addEventListener('DOMContentLoaded', function() {
    createMealCalendar();
    document.getElementById('calorieForm').addEventListener('submit', calculateCalories);
});

class MealPlanner {
    constructor() {
        this.storageKey = 'usbfit_meal_plan';
        this.currentPlan = this.loadMealPlan() || this.createEmptyPlan();
        this.init();
    }

    init() {
        this.createMealCalendar();
        this.setupEventListeners();
        this.loadSavedMeals();
    }

    createEmptyPlan() {
        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const mealTimes = ['Desayuno', 'Almuerzo', 'Cena', 'Snacks'];
        
        let plan = {};
        days.forEach(day => {
            plan[day] = {};
            mealTimes.forEach(meal => {
                plan[day][meal] = '';
            });
        });
        return plan;
    }

    createMealCalendar() {
        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const mealTimes = ['Desayuno', 'Almuerzo', 'Cena', 'Snacks'];
        const calendar = document.querySelector('.meal-calendar');
        
        let table = `
            <div class="meal-controls">
                <button id="saveMealPlan" class="btn-save">Guardar Plan</button>
                <button id="clearMealPlan" class="btn-clear">Limpiar Todo</button>
            </div>
            <table class="weekly-meals">
                <tr>
                    <th></th>
                    ${days.map(day => `<th>${day}</th>`).join('')}
                </tr>
        `;

        mealTimes.forEach(meal => {
            table += `<tr>
                <td class="meal-time">${meal}</td>
                ${days.map(day => `
                    <td class="meal-cell" data-day="${day}" data-meal="${meal}">
                        <div class="meal-content"></div>
                        <button class="edit-meal">Editar</button>
                    </td>
                `).join('')}
            </tr>`;
        });

        table += '</table>';
        calendar.innerHTML = table;
    }

    setupEventListeners() {
        document.querySelectorAll('.edit-meal').forEach(button => {
            button.addEventListener('click', (e) => {
                const cell = e.target.parentElement;
                this.editMeal(cell);
            });
        });

        document.getElementById('saveMealPlan').addEventListener('click', () => this.saveMealPlan());
        document.getElementById('clearMealPlan').addEventListener('click', () => this.clearMealPlan());
    }

    editMeal(cell) {
        const day = cell.dataset.day;
        const mealTime = cell.dataset.meal;
        const currentMeal = this.currentPlan[day][mealTime];

        // Create modal for meal editing
        const modalHtml = `
            <div class="meal-edit-modal">
                <div class="modal-content">
                    <h3>Cambiar ${mealTime} para el ${day}</h3>
                    <div class="meal-form">
                        <div class="form-group">
                            <label>Descripción de la Comida:</label>
                            <textarea id="mealDescription">${currentMeal}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Calorías:</label>
                            <input type="number" id="mealCalories" value="${currentMeal.calories || ''}" placeholder="Ingrese calorías">
                        </div>
                        <div class="button-group">
                            <button class="btn-save-meal">Guardar</button>
                            <button class="btn-cancel">Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHtml;
        document.body.appendChild(modalElement);

        const modal = modalElement.querySelector('.meal-edit-modal');
        
        modal.querySelector('.btn-save-meal').addEventListener('click', () => {
            const description = modal.querySelector('#mealDescription').value;
            const calories = modal.querySelector('#mealCalories').value;
            
            this.currentPlan[day][mealTime] = {
                description: description,
                calories: calories
            };
            
            this.updateCell(cell, description, calories);
            this.saveMealPlan();
            document.body.removeChild(modalElement);
        });

        modal.querySelector('.btn-cancel').addEventListener('click', () => {
            document.body.removeChild(modalElement);
        });
    }

    updateCell(cell, description, calories) {
        const content = cell.querySelector('.meal-content');
        content.innerHTML = `
            <div class="meal-description">${description}</div>
            ${calories ? `<div class="meal-calories">${calories} cal</div>` : ''}
        `;
        cell.classList.add('has-meal');
    }

    loadSavedMeals() {
        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const mealTimes = ['Desayuno', 'Almuerzo', 'Cena', 'Snacks'];

        days.forEach(day => {
            mealTimes.forEach(meal => {
                const savedMeal = this.currentPlan[day][meal];
                if (savedMeal) {
                    const cell = document.querySelector(`[data-day="${day}"][data-meal="${meal}"]`);
                    this.updateCell(cell, savedMeal.description, savedMeal.calories);
                }
            });
        });
    }

    saveMealPlan() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.currentPlan));
        this.showNotification('¡Plan de comidas guardado exitosamente!');
    }

    loadMealPlan() {
        const savedPlan = localStorage.getItem(this.storageKey);
        return savedPlan ? JSON.parse(savedPlan) : null;
    }

    clearMealPlan() {
        if (confirm('¿Está seguro de que desea borrar todas las comidas?')) {
            this.currentPlan = this.createEmptyPlan();
            this.saveMealPlan();
            document.querySelectorAll('.meal-cell').forEach(cell => {
                cell.querySelector('.meal-content').innerHTML = '';
                cell.classList.remove('has-meal');
            });
            this.showNotification('¡Plan de comidas borrado!');
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 2000);
    }
}

function showMealPlans(category) {
    // Sample meal plans data
    const mealPlans = {
        weightloss: {
            title: "Plan de Comidas para Pérdida de Peso",
            calories: "1500-1800",
            meals: [
                "Desayuno: Avena con frutos rojos",
                "Almuerzo: Ensalada de pollo a la parrilla",
                "Cena: Pescado al horno con verduras"
            ]
        },
        muscle: {
            title: "Plan de Comidas para Ganar Músculo",
            calories: "2500-3000", 
            meals: [
                "Desayuno: Batido de proteína con plátano",
                "Almuerzo: Bowl de pavo con arroz",
                "Cena: Filete magro con batata"
            ]
        },
        vegetarian: {
            title: "Plan de Comidas Vegetariano",
            calories: "2000-2200",
            meals: [
                "Desayuno: Revuelto de tofu",
                "Almuerzo: Bowl Buddha de quinoa",
                "Cena: Curry de lentejas con arroz"
            ]
        }
    };
    const plan = mealPlans[category];
    alert(`${plan.title}\nCalorías Diarias: ${plan.calories}\n\n${plan.meals.join('\n')}`);
}

function setupCalorieCalculator() {
    const calorieForm = document.getElementById('calorieForm');
    if (calorieForm) {
        calorieForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const weight = parseFloat(document.getElementById('weight').value);
            const height = parseFloat(document.getElementById('height').value);
            const age = parseFloat(document.getElementById('age').value);
            const activity = parseFloat(document.getElementById('activity').value);
            const gender = document.getElementById('gender').value;

            // Validate inputs
            if (!weight || !height || !age || !activity) {
                showCalorieError('Por favor complete todos los campos');
                return;
            }

            // Calculate BMR using Mifflin-St Jeor Equation
            let bmr;
            if (gender === 'male') {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
            } else {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
            }

            // Calculate total daily calories
            const dailyCalories = bmr * activity;

            // Display results
            const result = document.getElementById('calorieResult');
            result.innerHTML = `
                <div class="calorie-results">
                    <h3>Sus Necesidades Calóricas Diarias</h3>
                    <div class="calorie-item">
                        <span>Mantenimiento:</span>
                        <strong>${Math.round(dailyCalories)} calorías</strong>
                    </div>
                    <div class="calorie-item">
                        <span>Pérdida de Peso:</span>
                        <strong>${Math.round(dailyCalories - 500)} calorías</strong>
                        <small>(déficit de 500 calorías)</small>
                    </div>
                    <div class="calorie-item">
                        <span>Ganancia de Peso:</span>
                        <strong>${Math.round(dailyCalories + 500)} calorías</strong>
                        <small>(superávit de 500 calorías)</small>
                    </div>
                </div>
            `;
            result.style.display = 'block';
        });
    }
}

function showCalorieError(message) {
    const result = document.getElementById('calorieResult');
    result.innerHTML = `<div class="error-message">${message}</div>`;
    result.style.display = 'block';
}

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', setupCalorieCalculator);