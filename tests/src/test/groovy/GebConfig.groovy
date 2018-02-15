import org.openqa.selenium.chrome.ChromeDriver
import org.openqa.selenium.chrome.ChromeOptions
import org.openqa.selenium.remote.DesiredCapabilities

waiting {
    timeout = 10
}

driver = {
    ChromeOptions options = new ChromeOptions()
    options.addArguments("--headless", "--no-sandbox", "--disable-gpu")

    DesiredCapabilities capabilities = DesiredCapabilities.chrome()
    capabilities.setCapability(ChromeOptions.CAPABILITY, options)

    new ChromeDriver(capabilities)
}
