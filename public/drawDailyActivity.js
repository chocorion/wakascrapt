function drawDailyActivity(data) {
    // console.log(JSON.stringify(data, null, 4));
    let ctx = document.getElementById('codingActivityChart').getContext('2d');

    let dailyTimes = [];
    let labels = [];
    
    for (const day in data) {
        let str = new Date(day).toDateString();
        labels.push(str.substring(0, str.lastIndexOf(" ")));
        
        let currentTime = JSON.parse(data[day]).totalTime;

        if (currentTime === null) {
            dailyTimes.push(0);
            continue;
        }
        
        currentTime = currentTime.split(':');
        dailyTimes.push(currentTime[0] * 3600 + currentTime[1] * 60 + currentTime[2]);
    }


    let codingActivity = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Coding activity',
                data: dailyTimes,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}