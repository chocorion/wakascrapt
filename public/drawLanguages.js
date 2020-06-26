function drawLanguages(data) {
    let ctx = document.getElementById('languagesChart').getContext('2d');

    //console.log(JSON.stringify(data, null, 4));
    let languageAverage = {};
    
    for (const day in data) {
        const languages = JSON.parse(data[day]).languages;


        for (const language in languages) {
            if (languageAverage[language] === undefined) {
                languageAverage[language] = 0;
            }

            let tmp = languages[language].split(":");
            languageAverage[language] += parseInt(tmp[0]) * 3600 + parseInt(tmp[1]) * 60 + parseInt(tmp[2]);
        }
    }

    console.log(JSON.stringify(languageAverage, null, 4));

    let languagesDonut = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(languageAverage),
            datasets: [{
                label: 'Languages',
                data: Object.values(languageAverage),
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
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'right'
            }
        }
    })
}