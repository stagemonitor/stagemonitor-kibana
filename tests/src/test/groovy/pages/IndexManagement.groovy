package pages

import geb.Page

class IndexManagement extends Page {

    static url = "app/kibana#/management/kibana/index?_g=()"

    static at = {
        waitFor {
            indexPatternInput
        }
    }

    static content = {
        indexPatternInput { $("validate-index-name": "") }
        createButton { $("button", text: "Create") }
        setDefaultIndexPatternButton { $("button", text: "Set as default index") }
        form { $("form", "name": "form") }
    }

    void createIndexPattern(indexPattern) {
        indexPatternInput.value(indexPattern)
        waitFor { createButton }
        createButton.click()
        waitFor { setDefaultIndexPatternButton }
        setDefaultIndexPatternButton.click()
    }
}
