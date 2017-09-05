# stagemonitor-kibana ![build status](https://travis-ci.org/stagemonitor/stagemonitor-kibana.svg?branch=master)

This incubating plug-in for Kibana allows you to visualize distributed traces from spans collected by stagemonitor.

It looks like this:

1. The initial view after opening the plugin  
![Screenshot stagemonitor kibana plugin](https://user-images.githubusercontent.com/4292951/28964437-0c7c2538-790d-11e7-9bb0-eaf7e106a32b.png)

2. After clicking a trace, the basic trace visualization is shown
![Screenshot stagemonitor kibana plugin](https://user-images.githubusercontent.com/4292951/28964436-0c7be49c-790d-11e7-8c22-12cf6cae57ba.png)

3. In the trace visualization you may select a span to view the span details
![Screenshot stagemonitor kibana plugin](https://user-images.githubusercontent.com/4292951/28964439-0c7ff0dc-790d-11e7-943b-3456b469819b.png)

4. In the trace visualization you may select a span to view the span details
![Screenshot stagemonitor kibana plugin](https://user-images.githubusercontent.com/4292951/28964438-0c7f4f4c-790d-11e7-8f9f-795ec1689e3f.png)

5. This plugin also adds a scripted field in Kibana to open the trace visualization from a span in the discover tab
![Screenshot stagemonitor kibana plugin](https://user-images.githubusercontent.com/4292951/28964440-0c8503c4-790d-11e7-8d5a-a759ece14e71.png)


# Installation

[Have a look at our release page.](https://github.com/stagemonitor/stagemonitor-kibana/releases) Be sure to use the plugin version corresponding to your version of kibana, down to the minor patch level.


# Development

Start elasticsearch on your machine and run the following commands

    git clone https://github.com/elastic/kibana
    git checkout tags/v5.5.0
    npm install
    cd plugins
    git clone git@github.com:stagemonitor/stagemonitor-kibana.git
    cd stagemonitor-kibana
    npm install
    cd ../..
    npm start

Access Kibana under https://localhost:5601 -> the lazy optimizations may take some minutes for the initial pageload.
