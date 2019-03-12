var DATA_PATH = 'data.csv'
var MIN_YEAR = 1960
var MAX_YEAR = 2015
var ANIMATION_INTERVAL = 500

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

        var width = 1100 - margin.left - margin.right
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
                .range([0, width - 300]),
            y: d3.scaleLog()
                .domain([1, 100000])
                .range([height, 0])
        }

        var xAxis = d3.axisBottom().scale(chart.scales.x)
        var yAxis = d3.axisLeft().scale(chart.scales.y).ticks(5, "$")

        chart.svg.append('g')
            .style('font', "14px times")
            .style('font', "'Lato', Helvetica, Arial, sans-serif")
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)

        chart.svg.append('g')
            .attr('class', 'y-axis')
            .style('font', "14px times")
            .attr('transform', 'translate(' + width / 2.83 + ',0)')
            .call(yAxis)

        chart.svg.append('text')
            .attr('x', 0)
            .attr('y', height - 50)
            .attr('class', 'axis-label')
            .text('Autocracy')

        chart.svg.append('text')
            .attr('x', width - 380)
            .attr('y', height - 50)
            .attr('class', 'axis-label')
            .text('Democracy')

        chart.svg.append('text')
            .attr('x', width / 2 - 200)
            .attr('y', height + 40)
            .attr('class', 'axis-label')
            .text('PolityIV Index')

        chart.svg.append('text')
            .attr('x', width / 2 - 200)
            .attr('y', -15)
            .attr('class', 'axis-label')
            .text('$GDP per capita')

        chart.svg.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("transform", "translate(800,350)")
            .attr("class", "rect1");
      
        chart.svg.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("transform", "translate(800,380)")
            .attr("class", "rect2");
      
        chart.svg.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("transform", "translate(800,410)")
            .attr("class", "rect3");
    
        chart.svg.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("transform", "translate(800,440)")
            .attr("class", "rect4");
    
        chart.svg.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("transform", "translate(800,470)")
            .attr("class", "rect5");
        
        chart.svg.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("transform", "translate(800,320)")
            .attr("class", "rect6");
      
        chart.svg.append("text")
            .attr("x", 830)
            .attr("y", 363)
            .text("Asia")
            .attr("class", "label")
            
        chart.svg.append("text")
            .attr("x", 830)
            .attr("y", 394)
            .text("Africa")
            .attr("class", "label")
    
        chart.svg.append("text")
            .attr("x", 830)
            .attr("y", 424)
            .text("Europe")
            .attr("class", "label")
    
        chart.svg.append("text")
            .attr("x", 830)
            .attr("y", 334)
            .text("Australia")
            .attr("class", "label")
    
        chart.svg.append("text")
            .attr("x", 830)
            .attr("y", 453)
            .text("North Amercia")
            .attr("class", "label")
        
        chart.svg.append("text")
            .attr("x", 830)
            .attr("y", 484)
            .text("South Amercia")
            .attr("class", "label")

        chart.update()
    },

    update: function () {
        var chart = this

        var yearData = app.data.filter(function (d) {
            return d.year === app.globals.selected.year
        })

        var pastData = app.data.filter(function (d) {
            return d.year <= app.globals.selected.year
        })


        var countrypath = function (name) {
            return pastData.filter(function (d) {
                return d.country === name
            })
        }

        var line = d3.line()
            .x(function (d) { return chart.scales.x(d.polity4); })
            .y(function (d) { return chart.scales.y(d.gdp_per_capita); })

        var countries = chart.svg.selectAll('.country')
            .data(yearData, function (d) { return d.country })

        var enterCountries = countries.enter().append('circle')
        var exitCountries = countries.exit()
        var allCountries = countries.merge(enterCountries)

        var mouseover = function (d) {
            app.interval.stop()
            d3.select('body').classed('animating', false)
            app.globals.animating = false
            var xPosition = parseFloat(d3.select(this).attr('cx'));
            var yPosition = parseFloat(d3.select(this).attr('cy'));

            var tooltip = d3.select('#tooltip')
                .style('left', xPosition + 'px')
                .style('top', yPosition + 'px')

            tooltip.select('#Country')
                .style('color', function () {
                    if (d.continent === 'Europe') { return 'rgb(231,138,195)' };
                    if (d.continent === 'Asia') { return 'rgb(232,126,100)'}
                    if (d.continent === 'Australia') { return 'rgb(142,216,226)'}
                    if (d.continent === 'Africa') { return 'rgb(0,127,13)'}
                    if (d.continent === 'North America') { return 'rgb(48,195,232)'}
                    if (d.continent === 'South America') { return 'rgb(177,155,26)'}
                })
                .text(d.country)


            tooltip.select('#Polity4')
                .style('color', 'black')
                .text('Polity4 Index: ' + d.polity4 + '')

            tooltip.select('#GDP_per_capita')
                .style('color', 'black')
                .text('GDP per capita: $' + d.gdp_per_capita + '')

            tooltip.select('#tip1')
                .style('color', 'grey')
                .text('(The white line indicates')

            tooltip.select('#tip2')
                .style('color', 'grey')
                .text('the path of movement)')

            d3.select("#tooltip").classed("hidden", false);

            datum = countrypath(d.country)

            chart.svg.append('path')
                .datum(datum)
                .attr('class', 'pathline')
                .attr('d', line)

        }


        var mouseout = function () {
            d3.select('.pathline').remove()
            d3.select("#tooltip").classed("hidden", true);
            app.interval = d3.interval(app.incrementYear, ANIMATION_INTERVAL)
            d3.select('body').classed('animating', true)
            app.globals.animating = true
        }


        enterCountries
            .attr('class', function (d) {
                return 'country continent-' + d.continent.replace(' ', '-')
            })

        allCountries.transition().duration(ANIMATION_INTERVAL)
            .attr('r', function (d) { return chart.scales.r(d.population) })
            .attr('cx', function (d) { return chart.scales.x(d.polity4) })
            .attr('cy', function (d) { return chart.scales.y(d.gdp_per_capita) })

        chart.svg.selectAll('circle')
            .on('mouseover', mouseover)
            .on('mouseout', mouseout)

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
