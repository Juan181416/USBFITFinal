class SleepTracker {
    constructor() {
        this.sleepData = JSON.parse(localStorage.getItem('sleepData')) || [];
        this.initializeEventListeners();
        this.updateUI();
    }

    initializeEventListeners() {
        const form = document.getElementById('sleepForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addSleepEntry();
            });
        }
    }

    addSleepEntry() {
        const date = document.getElementById('sleepDate').value;
        const bedTime = document.getElementById('bedTime').value;
        const wakeTime = document.getElementById('wakeTime').value;
        const quality = document.getElementById('sleepQuality').value;
        const notes = document.getElementById('notes').value;

        const entry = {
            id: Date.now(),
            date,
            bedTime,
            wakeTime,
            quality: parseInt(quality),
            notes,
            duration: this.calculateDuration(bedTime, wakeTime)
        };

        this.sleepData.push(entry);
        this.saveSleepData();
        this.updateUI();
        document.getElementById('sleepForm').reset();
    }

    calculateDuration(bedTime, wakeTime) {
        const bedDate = new Date(`2000/01/01 ${bedTime}`);
        let wakeDate = new Date(`2000/01/01 ${wakeTime}`);
        
        if (wakeDate < bedDate) {
            wakeDate = new Date(`2000/01/02 ${wakeTime}`);
        }
        
        const diff = wakeDate - bedDate;
        return Math.round(diff / (1000 * 60 * 60) * 10) / 10;
    }

    deleteSleepEntry(id) {
        this.sleepData = this.sleepData.filter(entry => entry.id !== id);
        this.saveSleepData();
        this.updateUI();
    }

    saveSleepData() {
        localStorage.setItem('sleepData', JSON.stringify(this.sleepData));
    }

    updateUI() {
        this.updateStats();
        this.updateHistory();
        this.updateCharts();
    }

    updateStats() {
        if (this.sleepData.length === 0) return;

        const avgSleep = this.sleepData.reduce((acc, curr) => acc + curr.duration, 0) / this.sleepData.length;
        document.getElementById('avgSleep').textContent = `${avgSleep.toFixed(1)} horas`;

        // Calculate average bedtime
        const bedTimes = this.sleepData.map(entry => entry.bedTime);
        const avgBedtime = this.calculateAverageTime(bedTimes);
        document.getElementById('avgBedtime').textContent = avgBedtime;

        // Calculate average wake time
        const wakeTimes = this.sleepData.map(entry => entry.wakeTime);
        const avgWakeup = this.calculateAverageTime(wakeTimes);
        document.getElementById('avgWakeup').textContent = avgWakeup;
    }

    calculateAverageTime(times) {
        if (times.length === 0) return "00:00";

        const totalMinutes = times.reduce((acc, time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return acc + hours * 60 + minutes;
        }, 0);

        const avgMinutes = Math.round(totalMinutes / times.length);
        const hours = Math.floor(avgMinutes / 60);
        const minutes = avgMinutes % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    updateHistory() {
        const tbody = document.getElementById('sleepHistory');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.sleepData
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(entry => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(entry.date).toLocaleDateString()}</td>
                    <td>${entry.bedTime}</td>
                    <td>${entry.wakeTime}</td>
                    <td>${entry.duration} horas</td>
                    <td><span class="quality-badge quality-${entry.quality}">
                        ${this.getQualityText(entry.quality)}
                    </span></td>
                    <td>${entry.notes}</td>
                    <td>
                        <button class="btn-delete" onclick="sleepTracker.deleteSleepEntry(${entry.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
    }

    getQualityText(quality) {
        const qualities = {
            5: 'Excelente',
            4: 'Buena',
            3: 'Regular',
            2: 'Mala',
            1: 'Muy mala'
        };
        return qualities[quality];
    }

    updateCharts() {
        const last7Days = this.getLast7DaysData();
        this.createDurationChart(last7Days);
        this.createQualityChart(last7Days);
        this.createPatternChart(last7Days);
    }

    getLast7DaysData() {
        return this.sleepData
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-7);
    }

    createDurationChart(data) {
        const ctx = document.getElementById('sleepDurationChart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.durationChart) {
            this.durationChart.destroy();
        }

        this.durationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(entry => new Date(entry.date).toLocaleDateString()),
                datasets: [{
                    label: 'Horas de sueño',
                    data: data.map(entry => entry.duration),
                    backgroundColor: 'rgba(76, 175, 80, 0.5)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Horas'
                        }
                    }
                }
            }
        });
    }

    createQualityChart(data) {
        const ctx = document.getElementById('sleepQualityChart');
        if (!ctx) return;

        if (this.qualityChart) {
            this.qualityChart.destroy();
        }

        this.qualityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(entry => new Date(entry.date).toLocaleDateString()),
                datasets: [{
                    label: 'Calidad del sueño',
                    data: data.map(entry => entry.quality),
                    borderColor: 'rgba(33, 150, 243, 1)',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        min: 0,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const qualities = ['', 'Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente'];
                                return qualities[value];
                            }
                        }
                    }
                }
            }
        });
    }

    createPatternChart(data) {
        const ctx = document.getElementById('sleepPatternChart');
        if (!ctx) return;

        if (this.patternChart) {
            this.patternChart.destroy();
        }

        const bedTimes = data.map(entry => {
            const [hours, minutes] = entry.bedTime.split(':');
            return hours * 60 + parseInt(minutes);
        });

        const wakeTimes = data.map(entry => {
            const [hours, minutes] = entry.wakeTime.split(':');
            return hours * 60 + parseInt(minutes);
        });

        this.patternChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(entry => new Date(entry.date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Hora de dormir',
                        data: bedTimes,
                        borderColor: 'rgba(156, 39, 176, 1)',
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        fill: false
                    },
                    {
                        label: 'Hora de despertar',
                        data: wakeTimes,
                        borderColor: 'rgba(255, 152, 0, 1)',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                const hours = Math.floor(value / 60);
                                const minutes = value % 60;
                                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Initialize the sleep tracker
let sleepTracker;
document.addEventListener('DOMContentLoaded', () => {
    sleepTracker = new SleepTracker();
}); 