
var svgWidth = 780;
var svgHeight = 600;

var margin = {
    top: 30,
    right: 50,
    bottom: 70,
    left: 50
  };

var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;
console.log(width)
// create svg wraper
var svg = d3
    .select(".chart")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width",svgWidth);

var chartGroup  = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);;

var chooseXAxis = "poverty";
var chooseYAxis = "healthcare";

/******************************************* functions ************************************************/
// function for updating x y axis
function xScale(data_csv,chooseXAxis){
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data_csv, d => d[chooseXAxis] * 0.8),
        d3.max(data_csv, d => d[chooseXAxis] * 1.2)
    ])
    .range([0,width]);

    return xLinearScale;
};
function yScale(healthDate,chooseYAxis){
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthDate, d => d[chooseYAxis] * 0.8),
        d3.max(healthDate, d => d[chooseYAxis] * 1.2)
    ])
    .range([height,0]);
    return yLinearScale;
}
// function for updating xy axis
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .attr("transform",`translate(0,${height})`)
      .call(bottomAxis);

    return xAxis;
  }
function renderYAxes(newYScale, yAxis){
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
    .duration(1000)
    .call(leftAxis)

    return yAxis;
};


// function for updating circle
function renderXCircle(circleGroup, newXScale, chosenXAxis){
    // render circle
    circleGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
    return circleGroup;
};
function renderYCircle(circleGroup, newYScale, chosenYAxis){
    // render circle
    circleGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
    return circleGroup;
};

function renderText(textGroup, newXScale,chooseXAxis){
    // render text
    textGroup.transition()
    .duration(1000)
    .attr("x",d=>newXScale(d[chooseXAxis]))
    .text(d=>d["abbr"])
    return textGroup;
};
function renderYText(textGroup, newYScale,chooseYAxis){
    // render text
    textGroup.transition()
    .duration(1000)
    .attr("y",d=>newYScale(d[chooseYAxis]))
    .text(d=>d["abbr"])
    return textGroup;
};



// function for updating tooltip
function updateToolTip(chooseXAxis, chooseYAxis, circleGroup){
    var xLabel;
    var yLabel;

    if (chooseXAxis === "poverty" && chooseYAxis==="healthcare") {
        xLabel = "Poverty";
        yLabel = "Healthcare";
    }
    else if(chooseXAxis === "poverty" && chooseYAxis==="smokes") {
        xLabel = "Poverty";
        yLabel = "Smoke";
    }
    else if(chooseXAxis === "age" && chooseYAxis==="healthcare"){
        xLabel = "Age";
        yLabel = "Healthcare";
    }else {
        xLabel = "Age";
        yLabel = "Smoke";
    };

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
          return (`<strong>${d.state}</strong><br>
                  ${xLabel}:${d[chooseXAxis]}%<br>
                  ${yLabel}:${d[chooseYAxis]}%`);
        });
    
    chartGroup.call(toolTip);

    circleGroup.on("mouseover",function(d){
        toolTip.show(d, this);
    }).on("mouseout", function(d){
        toolTip.hide(d)
    }); 

  
};





// read in csv
d3.csv("assets/data/data.csv").then(function(healthDate,err) {
    console.log(healthDate);
    if (err) throw err;
    // change data type
    healthDate.forEach(data=>{
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    });

    // create x y axis scale
    var xLinearScale = xScale(healthDate,chooseXAxis);
    var yLinearScale = yScale(healthDate,chooseYAxis);
    
    // create axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftaxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
        .classed("x-axis",true)
        .attr("transform",`translate(0,${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis",true)
        //.attr("transform",`translate(20,0)`)
        .call(leftaxis)
    
    //create circle
    var circleGroup = chartGroup.selectAll("circle")
        .data(healthDate)
        .enter()
        .append("circle")
        .attr("class",d=>d.abbr)
        .attr("cx",d=>xLinearScale(d.poverty))
        .attr("cy",d=>yLinearScale(d.healthcare))
        .attr("r",15)
        .attr("fill","pink")
        .attr("opacity","0.5")

    // add state text in circle
    var textGroup = chartGroup.selectAll(".text")
        .data(healthDate)
        .join("text")
        .classed("text",true)
        .attr("x",d=>xLinearScale(d["poverty"]))
        .attr("y",d=>yLinearScale(d["healthcare"]))
        .attr("text-anchor", "middle")
        .attr("font-size","10px")
        .text(d=>d.abbr)

    // x label
    var xLabelGroup = chartGroup.append("g")
    var povertyLabel = xLabelGroup.append("text")
        .attr("x", `${width / 2}`)
        .attr("y", `${height + 40}`)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty(%)");
    var ageLabel = xLabelGroup.append("text")
        .attr("x", `${width / 2}`)
        .attr("y", `${height + 60}`)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");
    
    // y label
    var ylabelGroup = chartGroup.append("g")
    var healthcareLabel = ylabelGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left+50)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacks Healthcare(%)");
    var smokeLabel = ylabelGroup.append("text")
        .attr("transform","rotate(-90)")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left+30)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");


    xLabelGroup.selectAll("text")
        .on("click",function(){

            var value = d3.select(this).attr("value");
            // if select x label is not default label, then switch to the other
            if (value !== chooseXAxis) {
                chooseXAxis = value;
                xLinearScale = xScale(healthDate,chooseXAxis);
                // update x axis 
                xAxis = renderAxes(xLinearScale, xAxis);
                // update circle x value
                circleGroup = renderXCircle(circleGroup, xLinearScale, chooseXAxis);
                textGroup = renderText(textGroup, xLinearScale, chooseXAxis);
                updateToolTip(chooseXAxis,chooseYAxis,circleGroup);
                // changes classes to change bold text
                if (chooseXAxis==="age"){
                    ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else if (chooseXAxis==="poverty"){
                    ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
            };
        });
 
    ylabelGroup.selectAll("text").on("click",function(){
        var value = d3.select(this).attr("value");
        if (value !== chooseYAxis) {
            chooseYAxis = value;
            yLinearScale = yScale(healthDate,chooseYAxis);
            // update y axis 
            yAxis = renderYAxes(yLinearScale, yAxis);
            // update circle x value
            circleGroup = renderYCircle(circleGroup, yLinearScale, chooseYAxis);
            textGroup = renderYText(textGroup, yLinearScale, chooseYAxis);
            updateToolTip(chooseXAxis,chooseYAxis, circleGroup);
             // changes classes to change bold text
             if (chooseYAxis==="healthcare"){
                healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
                smokeLabel
                .classed("inactive", true)
                .classed("active", false);
            }else if (chooseYAxis==="smokes"){
                healthcareLabel
                .classed("inactive", true)
                .classed("active", false);
                smokeLabel
                .classed("active", true)
                .classed("inactive", false);
            }
        };

    });



    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
          return (`<strong>${d.state}</strong><br>
                  Poverty:${d.poverty}%<br>
                  Healthcare:${d.healthcare}%`);
        });
    
    chartGroup.call(toolTip);

    circleGroup.on("mouseover",function(d){
        toolTip.show(d, this);
    }).on("mouseout", function(d){
        toolTip.hide(d)
    }); 
    

    console.log(healthDate.map(d=>d.abbr))


    
});