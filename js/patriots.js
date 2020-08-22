var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".patriots_chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenYAxis = "RookieAV";

// function used for updating x-scale var upon click on axis label
function yScale(teamData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(teamData, d => d[chosenYAxis]) - 5,
    d3.max(teamData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;

}

// function used for updating bars group with a transition to
// new bars
function renderBars(barGroup, newYScale, chosenYAxis) {

  barGroup.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]))
    .attr("height", d => height - newYScale(d[chosenYAxis]))
  return barGroup;
}

// function used for updating bars group with new tooltip
function updateToolTip(chosenYAxis, barGroup) {

  var label;

  if (chosenYAxis === "RookieAV") {
    label = "Rookie Approximate Value:";
  }
  else {
    label = "Career Approximate Value:";
  }

  var toolTip = d3.tip()
    .attr("class", "patriots_tooltip")
    .offset([80, -60])
    .html(function (d) {
      return (`${d.Year + " " + d.Team}<br>${label} ${d[chosenYAxis]}`);
    });

  barGroup.call(toolTip);

  barGroup.on("mouseover", function (data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return barGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("Bar_Chart_Data.csv").then(function (teamData, err) {
  if (err) throw err;

  var FranchiseTeamData = teamData.filter(function (d) {
    if (d["Team"] == "New England Patriots") {
      return d;
    }
  })

  // parse data
  FranchiseTeamData.forEach(function (data) {
    data.RookieAV = Math.round(+data.RookieAV * 10) / 10;
    data.CarAV = Math.round(+data.CarAV * 10) / 10;
    data.Year = +data.Year;
  });

  console.log(teamData);
  console.log(FranchiseTeamData);


  // yLinearScale function above csv import
  var yLinearScale = yScale(FranchiseTeamData, chosenYAxis);

  // Create x scale function
  var xLinearScale = d3.scaleBand()
    .domain(d3.range(FranchiseTeamData.length))
    .range([0, width])
    .padding(0.1);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  chartGroup.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(xLinearScale).tickFormat(i => FranchiseTeamData[i].Year).tickSizeOuter(0))
  .selectAll("text")
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-45)")

  // append x axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);


  // append initial bars
  var barGroup = chartGroup.selectAll("rect")
    .data(FranchiseTeamData)
    .enter()
    .append("rect")
    .attr("x", (d, i) => xLinearScale(i))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("height", d => height - yLinearScale(d[chosenYAxis]))
    .attr("width", xLinearScale.bandwidth())
    .classed("patriots_inactive", true)

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height})`);

    svg.append("text")
    .attr("x", width / 2 )
    .attr("y", 20)
    .style("text-anchor", "center")
    .text("New England Patriots Draft History by AV")
    .classed("patriots_title", true)
  ;


  var Rookie_AV = labelsGroup.append("text")
    .attr("y", -480)
    .attr("x", (height / 2))
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "RookieAV") // value to grab for event listener
    .classed("active", true)
    .classed("patriots_axis-text", true)
    .text("Rookie Approximate Value");


  var Career_AV = labelsGroup.append("text")
    .attr("y", -460)
    .attr("x", (height / 2))
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "CarAV") // value to grab for event listener
    .classed("patriots_inactive", true)
    .classed("patriots_axis-text", true)
    .text("Career Approximate Value");

  //append x axis
  chartGroup.append("text")
    .attr("x", (width / 2))
    .attr("y", 460)
    .attr("value", "Year")
    .classed("patriots_axis-text", true)
    .text("Year");

  // updateToolTip function above csv import
  var barGroup = updateToolTip(chosenYAxis, barGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        //console.log(chosenYAxis);

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(FranchiseTeamData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderAxes(yLinearScale, yAxis);

        // updates bars with new x values
        barGroup = renderBars(barGroup, yLinearScale, chosenYAxis);


        // updates tooltips with new info
        barGroup = updateToolTip(chosenYAxis, barGroup);

        // changes classes to change bold text
        if (chosenYAxis === "CarAV") {
          Career_AV
            .classed("patriots_active", true)
            .classed("patriots_inactive", false);
          Rookie_AV
            .classed("patriots_active", false)
            .classed("patriots_inactive", true);
        }
        else {
          Career_AV
            .classed("patriots_active", false)
            .classed("patriots_inactive", true);
          Rookie_AV
            .classed("patriots_active", true)
            .classed("patriots_inactive", false);
        }
      }
    });
}).catch(function (error) {
  console.log(error);
});



//Creating a Table

d3.csv("Draft_Data.csv").then(function (playerData) {

  var FranchisePlayerData = playerData.filter(function (d) {
    if (d["Team"] == "New England Patriots") {
      return d;
    }
  })

  console.log(playerData);
  console.log(FranchisePlayerData);

  FranchisePlayerData.forEach(function (data) {
    data.Rnd = +data.Rnd;
    data.Pick = +data.Pick;
    data.RookieAV = +data.RookieAV;
    data.CarAV = +data.CarAV;
  });

  var button = d3.select("#filter-btn");
  var form = d3.select("#form");
  var tbody = d3.select("tbody");

  // Give the button and form a function to run on an event

  button.on("click", runEnter);
  form.on("submit", runEnter);

  function runEnter() {

    d3.event.preventDefault();

    var inputElement = d3.select("#Year-Input");

    var inputValue = inputElement.property("value");

    var filteredData = FranchisePlayerData.filter(Draft_class => Draft_class.Year === inputValue);

    console.log(inputValue);
    console.log(filteredData);

    tbody.html("")

    filteredData.forEach(function (DraftedPlayers) {

      var row = tbody.append("tr");

      Object.entries(DraftedPlayers).forEach(function ([key, value]) {
        var cell = row.append("td");
        cell.text(value)

      })
    }
    )
  };

}).catch(function (error) {
  console.log(error);
});
