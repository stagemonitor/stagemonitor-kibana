package pages

import geb.Page

class StagemonitorPlugin extends Page {

    static url = "app/stagemonitor-kibana"

    static at = {
        waitFor {
            $(".trace-table")
        }
    }

    static content = {
        traceRows { $(".trace-row") }
        callTreeTab { $("a", text: "Call tree") }
        callTreeRows { $(".callTree tbody tr").findAll {it.displayed} }
        callTreeRowExpanders { $(".expander") }
    }

    void openTraceRow(int index) {
        waitFor { traceRows }
        traceRows[index].click()
    }

    void openSpan(String name) {
        waitFor { $(".node--name") }
        $(".node--name", text: name).click()
        waitFor { callTreeTab }
    }
}
