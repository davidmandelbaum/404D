var depth_chart = new Highcharts.Chart({
  chart: {
    renderTo: 'depth_gauge',
    type: 'gauge',
    plotBorderWidth: 0,
    plotBackgroundColor: null,
    backgroundColor: null,
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
      startAngle: 30,
      endAngle: 150,
      background: null,
      center: ['50%', '50%'],
      size: '80%'
    }],

    yAxis: [{
      min: 2,
      max: 7,
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
        from: 2,
        to: 3.8,
        color: '#C02316',
        innerRadius: '100%',
        outerRadius: '110%'
      },
      { from: 4.7,
        to: 6.2,
        color: '#00C900',
        innerRadius: '100%',
        outerRadius: '110%'},
      { from: 3.8,
        to: 4.7,
        color: '#e6ff08',
        innerRadius: '100%',
        outerRadius: '110%'},
      { from: 6.2,
        to: 7,
        color: '#e6ff08',
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

