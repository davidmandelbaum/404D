var compressions_chart = new Highcharts.Chart({
  chart: {
    renderTo: 'compressions_gauge',
    type: 'gauge',
    plotBorderWidth: 0,
    plotBackgroundColor: null,
    backgroundColor: null,
    height: 270,
    style: {
      fontFamily: 'Lato'
    }
  },

    title: {
      text: ''
    },

    tooltip: {
      enabled: false
    },

    pane: [{
      startAngle: -60,
      endAngle: 60,
      background: null,
      center: ['50%', '60%'],
      size: '95%'
    }],

    yAxis: [{
      min: 60,
      max: 150,
      minorTickPosition: 'outside',
      minorTickLength: 5,
      tickLength: 10,
      tickPosition: 'outside',
      labels: {
        rotation: 'auto',
        distance: 20,
        style: {
          fontSize: '16px',
          fontFamily: 'Lato'
        }
      },
      plotBands: [{
        from: 0,
        to: 85,
        color: '#C02316',
        innerRadius: '100%',
        outerRadius: '110%'
      },
      { from: 100,
        to: 120,
        color: '#00C900',
        innerRadius: '100%',
        outerRadius: '110%'},
      { from: 85,
        to: 100,
        color: '#e6ff08',
        innerRadius: '100%',
        outerRadius: '110%'},
      { from: 120,
        to: 135,
        color: '#e6ff08',
        innerRadius: '100%',
        outerRadius: '110%'},
      { from: 135,
        to: 160,
        color: '#C02316',
        innerRadius: '100%',
        outerRadius: '110%'}],
      pane: 0,
      title: {
        text: '',
        y: -40
      }
    }],

    plotOptions: {
      gauge: {
        dataLabels: {
          enabled: false
        },
        dial: {
          radius: '115%',
          topWidth: 3,
          baseWidth: 6
        }
      }
    },


    series: [{
      data: [0],
      yAxis: 0
    }]

});

