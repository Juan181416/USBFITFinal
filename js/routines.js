let routineManager;

class RoutineManager {
    constructor() {
        this.routines = JSON.parse(localStorage.getItem('routines')) || [];
        this.workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];
        this.currentEditId = null;
        this.initializeEventListeners();
        this.renderDashboard();
        this.renderWeeklySchedule();
        this.renderRoutines();
    }

    initializeEventListeners() {
        // Create button
        const createButton = document.getElementById('createRoutineBtn');
        if (createButton) {
            createButton.addEventListener('click', () => this.showModal());
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => 
                    b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterRoutines(e.target.dataset.type);
            });
        });

        // Form submission
        const routineForm = document.getElementById('routineForm');
        if (routineForm) {
            routineForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveRoutine();
            });
        }

        // Add exercise button
        const addExerciseBtn = document.getElementById('addExerciseBtn');
        if (addExerciseBtn) {
            addExerciseBtn.addEventListener('click', () => this.addExerciseField());
        }

        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('routineModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    renderDashboard() {
        // Update active routines count
        document.getElementById('activeRoutines').textContent = this.routines.length;

        // Update completed workouts count
        document.getElementById('completedWorkouts').textContent = this.workoutHistory.length;

        // Calculate total workout time
        const totalMinutes = this.workoutHistory.reduce((acc, workout) => 
            acc + (workout.duration || 0), 0);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        document.getElementById('totalTime').textContent = 
            `${hours}h ${minutes}m`;
    }

    renderWeeklySchedule() {
        const scheduleGrid = document.getElementById('scheduleGrid');
        if (!scheduleGrid) return;

        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        scheduleGrid.innerHTML = '';

        days.forEach((day, index) => {
            const dayElement = document.createElement('div');
            dayElement.className = 'schedule-day';
            
            // Get routines scheduled for this day
            const routinesForDay = this.routines.filter(routine => 
                routine.schedule && routine.schedule.includes(index));

            if (routinesForDay.length) {
                dayElement.classList.add('has-routine');
            }

            dayElement.innerHTML = `
                <div class="day-name">${day}</div>
                ${routinesForDay.map(routine => `
                    <div class="routine-tag">${routine.name}</div>
                `).join('')}
            `;
            
            scheduleGrid.appendChild(dayElement);
        });
    }

    filterRoutines(type) {
        const filteredRoutines = type === 'all' ? 
            this.routines : 
            this.routines.filter(routine => routine.type === type);
        this.renderRoutines(filteredRoutines);
    }

    showModal(editId = null) {
        const modal = document.getElementById('routineModal');
        if (!modal) return;

        this.currentEditId = editId;
        modal.style.display = 'block';

        const form = document.getElementById('routineForm');
        const exercisesList = document.getElementById('exercisesList');

        // Reset form
        if (form) form.reset();
        if (exercisesList) exercisesList.innerHTML = '';

        if (editId) {
            // Populate form for editing
            const routine = this.routines.find(r => r.id === editId);
            if (routine) {
                document.getElementById('routineName').value = routine.name;
                document.getElementById('routineType').value = routine.type;
                document.getElementById('routineNotes').value = routine.notes || '';

                // Set weekday checkboxes
                if (routine.schedule) {
                    routine.schedule.forEach(day => {
                        const checkbox = document.querySelector(`.weekday-selector input[value="${day}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }

                // Add existing exercises
                routine.exercises.forEach(exercise => this.addExerciseField(exercise));
            }
        } else {
            // Add one empty exercise field for new routine
            this.addExerciseField();
        }
    }

    addExerciseField(exerciseData = null) {
        const exercisesList = document.getElementById('exercisesList');
        if (!exercisesList) return;

        const exerciseField = document.createElement('div');
        exerciseField.className = 'exercise-field';
        
        exerciseField.innerHTML = `
            <div class="exercise-inputs">
                <input type="text" 
                    class="exercise-input" 
                    placeholder="Nombre del ejercicio"
                    value="${exerciseData ? exerciseData.name : ''}" 
                    required>
                <input type="number" 
                    class="sets-input" 
                    placeholder="Sets"
                    value="${exerciseData ? exerciseData.sets || '3' : '3'}" 
                    min="1" required>
                <input type="number" 
                    class="reps-input" 
                    placeholder="Reps"
                    value="${exerciseData ? exerciseData.reps || '10' : '10'}" 
                    min="1" required>
            </div>
            <button type="button" class="btn-remove-exercise" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        exercisesList.appendChild(exerciseField);
    }

    saveRoutine() {
        const name = document.getElementById('routineName').value;
        const type = document.getElementById('routineType').value;
        const notes = document.getElementById('routineNotes').value;
        
        // Get selected weekdays
        const schedule = Array.from(document.querySelectorAll('.weekday-selector input:checked'))
            .map(input => Number(input.value));

        // Get exercises
        const exercises = Array.from(document.querySelectorAll('.exercise-field'))
            .map(field => ({
                name: field.querySelector('.exercise-input').value,
                sets: Number(field.querySelector('.sets-input').value),
                reps: Number(field.querySelector('.reps-input').value)
            }));

        const routine = {
            id: this.currentEditId || Date.now(),
            name,
            type,
            schedule,
            exercises,
            notes,
            created: new Date().toISOString()
        };

        if (this.currentEditId) {
            const index = this.routines.findIndex(r => r.id === this.currentEditId);
            this.routines[index] = routine;
        } else {
            this.routines.push(routine);
        }

        this.saveToLocalStorage();
        this.renderDashboard();
        this.renderWeeklySchedule();
        this.renderRoutines();
        this.closeModal();
    }

    renderRoutines(filteredRoutines = this.routines) {
        const grid = document.getElementById('routinesGrid');
        if (!grid) return;
    
        grid.innerHTML = '';
    
        filteredRoutines.forEach(routine => {
            const card = document.createElement('div');
            card.className = 'routine-card';
            
            card.innerHTML = `
                <div class="routine-header">
                    <h3>${routine.name}</h3>
                    <span class="routine-type">${this.getTypeLabel(routine.type)}</span>
                </div>
                <div class="routine-body">
                    ${routine.exercises.map(exercise => `
                        <div class="exercise-item">
                            <i class="fas fa-dumbbell"></i>
                            <div>
                                ${exercise.name}
                                <div class="exercise-details">
                                    <span>${exercise.sets} sets</span>
                                    <span>${exercise.reps} reps</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    ${routine.notes ? `
                        <div class="routine-notes">
                            <i class="fas fa-sticky-note"></i> ${routine.notes}
                        </div>
                    ` : ''}
                </div>
                <div class="routine-actions">
                    <button class="btn-edit" onclick="routineManager.showModal(${routine.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="routineManager.deleteRoutine(${routine.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            `;
            
            grid.appendChild(card);
        });
    }

    deleteRoutine(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
            this.routines = this.routines.filter(routine => routine.id !== id);
            this.saveToLocalStorage();
            this.renderDashboard();
            this.renderWeeklySchedule();
            this.renderRoutines();
        }
    }

    closeModal() {
        const modal = document.getElementById('routineModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentEditId = null;
    }

    saveToLocalStorage() {
        localStorage.setItem('routines', JSON.stringify(this.routines));
        localStorage.setItem('workoutHistory', JSON.stringify(this.workoutHistory));
    }

    getTypeLabel(type) {
        const types = {
            strength: 'Fuerza',
            cardio: 'Cardio',
            flexibility: 'Flexibilidad',
            mixed: 'Mixta'
        };
        return types[type] || type;
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    routineManager = new RoutineManager();
});