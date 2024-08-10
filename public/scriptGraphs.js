// Total Stack
const ctxStack = document.getElementById('totalStackGraph');

  new Chart(ctxStack, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

// Total Pie
const ctxPie = document.getElementById('totalPieGraph');

// steak
const ctxStreak = document.getElementById('streakGraph');

// gap
const ctxGap = document.getElementById('gapGraph');

// leaderBoard
const ctxLeaderBoard = document.getElementById('leaderboardGraph');

// average
const ctxAverage = document.getElementById('averageGraph');

// commonHours
const ctxCommonHours = document.getElementById('commonHoursGraph');
