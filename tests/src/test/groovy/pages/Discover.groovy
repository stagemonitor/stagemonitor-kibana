package pages

import geb.Page

class Discover extends Page {

    static url = "app/kibana#/discover"

    static at = {
        waitFor {
            timeRangeChooser
        }
    }

    static content = {
        timeRangeChooser { $("data-test-subj": "globalTimepickerRange") }
        docTable { $("data-test-subj": "docTable") }
        docTableRows { $(".discover-table-open-icon, .discover-table-open-button") }
    }

    void setTimeRange(String timeRange) {
        timeRangeChooser.click()
        $("a", text: timeRange).click()
        waitFor { docTable }
    }
}
