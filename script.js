var DATA_PATH = 'data_gdp.csv'
var MIN_YEAR = 1960
var MAX_YEAR = 2015
var ANIMATION_INTERVAL = 750

var Scatterplot
var Controls
var app

Scatterplot = function () {
    this.setup()
}

Scatterplot.prototype = {
    setup: function () {
        var chart = this

        var margin = { top: 30, right: 30, bottom: 45, left: 45 }

        var width = 800 - margin.left - margin.right
        var height = 600 - margin.top - margin.bottom

        chart.svg = d3.select('#scatterplot')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        chart.scales = {
            r: d3.scaleSqrt()
                .domain([0, d3.max(app.data, function (d) { return d.population })])
                .range([0, 60]),
            x: d3.scaleLinear()
                .domain([-10, 10])
                .range([0, width]),
            y: d3.scaleLog()
                .domain([1, 100000])
                .range([height, 0])
        }

        var xAxis = d3.axisBottom().scale(chart.scales.x)
        var yAxis = d3.axisLeft().scale(chart.scales.y).ticks(5,"$")

        chart.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)

        chart.svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', 'translate(' + width/2 + ',0)')
            .call(yAxis)
        
        chart.svg.append('text')      
            .attr('x', 0)
            .attr('y', height-50)
            .attr('class', 'axis-label')
            .text('Autocracy')
        
        chart.svg.append('text')
            .attr('x', width-80)
            .attr('y', height-50)
            .attr('class', 'axis-label')
            .text('Democracy')
        
        chart.svg.append('text')
            .attr('x', width/2-40)
            .attr('y', height+40)
            .attr('class', 'axis-label')
            .text('PolityIV Index')
        
        chart.svg.append('text')
            .attr('x', width/2-40)
            .attr('y', -15)
            .attr('class', 'axis-label')
            .text('$GDP per capita')

        chart.update()
    },

    update: function () {
        var chart = this

        var yearData = app.data.filter(function (d) {
            return d.year === app.globals.selected.year
        })

        var countries = chart.svg.selectAll('.country')
            .data(yearData, function (d) { return d.country })

        var enterCountries = countries.enter().append('circle')
        var exitCountries = countries.exit()
        var allCountries = countries.merge(enterCountries)
        
        var mouseover = function(d){
            app.interval.stop()
            d3.select('body').classed('animating', false)
            app.globals.animating = false
            table = chart.svg.append('rect')
                .attr('width', 300)
                .attr('height', 180)
                .attr('class','rect')
            chart.svg.append('text')
                .attr('x', 50)
                .attr('y', 50)
                .attr('class', 'info')
                .text('Country : ' + d.country + '')
            chart.svg.append('text')
                .attr('x', 50)
                .attr('y', 100)
                .attr('class', 'info')
                .text('Polity4 Index : ' + d.polity4 + '')
            chart.svg.append('text')
                .attr('x', 50)
                .attr('y', 150)
                .attr('class', 'info')
                .text('GDP per capita : $' + d.gdp_per_capita + '')}
        
        var mouseout = function () {
            d3.select('.rect').remove()
            d3.selectAll('.info').remove()
            app.interval = d3.interval(app.incrementYear, ANIMATION_INTERVAL)
            d3.select('body').classed('animating', true)
            app.globals.animating = true
        }

        enterCountries
            .attr('class', function (d) {
                return 'country continent-' + d.continent.replace(' ', '-')
            })
            .on('mouseover', mouseover)
            .on('mouseout', mouseout)
        


        allCountries.transition().duration(ANIMATION_INTERVAL)
            .attr('r', function (d) { return chart.scales.r(d.population) })
            .attr('cx', function (d) { return chart.scales.x(d.polity4) })
            .attr('cy', function (d) { return chart.scales.y(d.gdp_per_capita) })

        exitCountries.remove()
    }
}

Controls = function (selector) {
    this.div = d3.select(selector)

    this.setup()
};

Controls.prototype = {
    setup: function () {
        this.div.select('#year-label').text(app.globals.selected.year)

        this.div.select('#animate').on('click', app.toggleAnimation)

        this.update()
    },

    update: function () {
        this.div.select('#year-label')
            .transition(0).delay(ANIMATION_INTERVAL / 2)
            .text(app.globals.selected.year)

        this.div.select('#animate')
            .classed('playing', app.globals.animating)
            .classed('paused', !app.globals.animating)
    }
}

app = {
    data: [],
    components: [],
    globals: {
        available: { years: d3.range(MIN_YEAR, MAX_YEAR + 1) },
        selected: { year: MIN_YEAR },
        animating: false
    },

    initialize: function (data) {
        app.data = data
        app.components.scatterplot = new Scatterplot('#scatterplot')
        app.components.controls = new Controls('#controls')
        d3.select(window).on('keydown', function () {
            var event = d3.event

            switch (event.which) {
                case 32: 
                    app.toggleAnimation()
                    break

                default:
                    return
            }

            event.preventDefault()
        })

        d3.select('#main')
            .style('opacity', 0)
            .style('display', 'block')
            .transition()
            .style('opacity', 1)

        app.toggleAnimation()
    },

    resize: function () {
        for (var component in app.components) {
            if (app.components[component].resize) {
                app.components[component].resize()
            }
        }
    },

    update: function () {
        for (var component in app.components) {
            if (app.components[component].update) {
                app.components[component].update()
            }
        }
    },

    setYear: function (year) {
        app.globals.selected.year = year;
        app.update()
    },

    incrementYear: function () {
        var availableYears = app.globals.available.years;
        var currentIdx = availableYears.indexOf(app.globals.selected.year);
        app.setYear(availableYears[(currentIdx + 1) % availableYears.length]);
    },

    toggleAnimation: function () {
        if (app.globals.animating) {
            app.interval.stop()
            d3.select('body').classed('animating', false)
            app.globals.animating = false
        } else {
            app.interval = d3.interval(app.incrementYear, ANIMATION_INTERVAL)
            d3.select('body').classed('animating', true)
            app.globals.animating = true
        }
    

        app.update()
    
    
    }
}

d3.csv(DATA_PATH, function (d) {

    return {
        country: d.country,
        year: +d.year,
        conflict: +d.conflict,
        polity4: +d.polity4,
        population: +d.population,
        continent: d.continent,
        gdp_per_capita: +d.gdp_per_capita
    }
}, app.initialize)
