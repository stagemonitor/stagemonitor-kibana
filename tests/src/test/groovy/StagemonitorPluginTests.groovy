import geb.junit4.GebReportingTest
import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import groovyx.net.http.HTTPBuilder
import groovyx.net.http.URIBuilder
import org.junit.Before
import org.junit.Test
import pages.Discover
import pages.IndexManagement
import pages.StagemonitorPlugin

import static groovyx.net.http.ContentType.JSON
import static groovyx.net.http.Method.DELETE
import static groovyx.net.http.Method.POST
import static groovyx.net.http.Method.PUT

class StagemonitorPluginTests extends GebReportingTest {

    @Test
    void testSpans() {
        to StagemonitorPlugin
        openTraceRow(0)
        openSpan("Process Find Form")

        // check we've opened the tag page of the span
        waitFor { $("td", text: "http.url") }

        callTreeTab.click()

        waitFor { callTreeRows.size() == 3 }
        callTreeRowExpanders.last().click()
        waitFor { callTreeRows.size() == 2 }
        callTreeRowExpanders.last().click()
        waitFor { callTreeRows.size() == 3 }
    }

    @Test
    void checkDiscoverTabForLinkToPlugin() {
        to IndexManagement
        createIndexPattern("stagemonitor-spans-*")

        to StagemonitorPlugin
        sleep(1500) // wait for creation of scripted fields

        to Discover
        setTimeRange("Last 5 years")
        docTableRows[0].click()
        waitFor {
            $("a", text: "Trace Visualization")
        }
    }

    @Before
    void importMockData() {
        deleteDataIfExists()

        importTypeMapping()

        def slurper = new JsonSlurper()
        def spans = slurper.parse(getClass().getResource("mock-spans.json"))
        spans.each { span ->
            importSpan(span)
        }

        // wait for elasticsearch having indexed the data
        sleep(2000)
    }

    private deleteDataIfExists() {
        def spansHttp = new HTTPBuilder("http://localhost:9200/stagemonitor-spans-2017.08.04")
        try {
            spansHttp.request(DELETE, JSON) {}
        } catch (Exception e) {
            // ignore if index does not exist
        }

        def kibanaDeleteByQuery = new HTTPBuilder("http://localhost:9200/.kibana/_delete_by_query")
        try {
            kibanaDeleteByQuery.request(POST, JSON) { req ->
                body = '{"query": {"match": { "title": "stagemonitor-spans-*"}}}'
            }
        } catch (Exception e) {
            // ignore if index does not exist
            println e
        }
    }

    private importTypeMapping() {
        def slurper = new JsonSlurper()

        def http = new HTTPBuilder("http://localhost:9200/stagemonitor-spans-2017.08.04")
        http.request(PUT, JSON) { req ->
            body = slurper.parse(getClass().getResource("type-mapping.json"))
        }
    }

    private void importSpan(span) {
        def uriBuilder = new URIBuilder('http://localhost:9200/stagemonitor-spans-2017.08.04/spans/')
        uriBuilder.path += span._id
        def http = new HTTPBuilder(uriBuilder.toURI())
        def response = http.request(PUT, JSON) { req ->
            body = JsonOutput.toJson(span._source)
        }
    }

}
