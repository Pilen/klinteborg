import datetime
import time
from pathlib import Path

import selenium
import selenium.webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

from backend.config import config

def download():
    driver = None
    try:
        now = datetime.datetime.now()
        download_dir = config.download_dir / now.isoformat()
        tmp_dir = download_dir / "tmp"
        download_dir.mkdir(exists_ok=False)
        tmp_dir.mkdir()

        # Open driver
        options = selenium.webdriver.firefox.options.Options()
        options.set_preference("browser.download.folderList", 2)
        options.set_preference("browser.download.manager.showWhenStarting", False)
        options.set_preference("browser.download.dir", str(tmp_dir))
        driver = selenium.webdriver.Firefox(options=options)
        driver.implicitly_wait(30)

        # Open website
        driver.get("https://medlem.fdf.dk/web/login")

        login(driver)
        navigate_to_arrangementer(driver)
        show_all_participants(driver)
        select_all_participants(driver)
        download_xls(driver)
        move_file_to(tmp_dir, download_dir / "arrangement.xls")

        filter_out_annulleret(driver)
        download_custom_xls(driver)
        move_file_to(tmp_dir, download_dir / "custom.xls")

        navigate_to_medlemer(driver)
        show_all_participants(driver)
        select_all_participants(driver)
        download_xls(driver)
        move_file_to(tmp_dir, download_dir / "medlemmer.xls")
    finally:
        if driver is not None:
            driver.quit()


def move_file_to(from_dir, destination, timeout=60*2):
    """
    Move (rename) the single file found in `from_dir` to `destination`.
    Will wait till the file is there for timeout seconds
    """
    start = time.monotonic()
    deadline = start + timeout
    while True:
        files = from_dir.glob("*")
        if files:
            time.sleep(1.0)
            break
        if time.monotonic() > deadline:
            raise Exception("No file downloaded before timeout")
    files = from_dir.glob("*")
    assert len(files) != 0, "A file should be there, else something deleted it"
    assert len(files) == 1, "Too many files downloaded, move them before continuing"
    file = files[0]
    assert file.suffix == destination.suffix
    file.rename(destination)


def login(driver):
    """
    login to website
    """
    el = driver.find_element(By.ID, "login")
    el.send_keys(config.medlemsservice_user)
    el = driver.find_element(By.ID, "password")
    el.send_keys(config.medlemsservice_password)
    el.send_keys(Keys.ENTER)

def navigate_to_arrangementer(driver):
    year = config.start_date.year
    driver.find_element(By.LINK_TEXT, "Arrangementer").click()
    #     Needed as item has been "archived"
    if archived == True:
        driver.find_element(By.CSS_SELECTOR, ".o_searchview .o_searchview_input_container .o_searchview_facet div[title=\"Fjern\"]").click()
        el = driver.find_element(By.XPATH, f"//*[text() = 'Klinteborg {year}']")
        # driver.execute_script("arguments[0].scrollIntoView()", el)
        # el.click()
        driver.execute_script("arguments[0].click()", el)
    else:
        driver.find_element(By.XPATH, f"//*[text() = 'Klinteborg {year}']").click()
    driver.find_element(By.XPATH, "//*[text() = 'Besvarelser']").click()
    time.sleep(5)

def show_all_participants(driver):
    """
    Show all the participants, not just the first 80
    """
    limit = int(driver.find_element(By.CLASS_NAME, "o_pager_limit").text)
    el = driver.find_element(By.CLASS_NAME, "o_pager_value")
    el.click()
    el = el.find_element(By.CLASS_NAME, "o_input")
    for i in range(10):
        el.send_keys(Keys.DELETE)
    el.send_keys(f"1-{limit}")
    el.send_keys(Keys.ENTER)
    driver.find_element(By.XPATH, f"//span[@class = 'o_pager_value'][text() = '1-{limit}']")
    time.sleep(5)

def select_all_participants(driver):
    """
    Select all the participants on the current page
    """
    driver.find_element(By.CSS_SELECTOR, "table > thead > tr > th.o_list_record_selector > div > input").click()
    time.sleep(5)

def download_xls(driver):
    """
    Download an xls file, via the "Export xls" button
    """
    driver.find_element(By.CSS_SELECTOR, ".o_control_panel button[title='Export xls']").click()



def filter_out_annulleret(driver):
    driver.find_element(By.XPATH, f"//table/thead/tr/th[text() = 'Status']").click()
    time.sleep(5)
    select_all_participants(driver)
    els = driver.find_elements(By.XPATH, f"//table/tbody/tr/td[text() = 'Annulleret']/../td[@class = 'o_list_record_selector']/div/input")
    for el in els:
        driver.execute_script("arguments[0].click()", el)

def download_custom_xls(driver):
    """
    Expand the 'Handling' menu, and open the 'Export' modal.
    Then download the "Klinteborg - custom" xls
    This saved export has to be created
    (Alternatively we could setup the download here instead?)
    """
    driver.find_element(By.XPATH, "//aside[@class = 'o_cp_sidebar']//button/span[text() = 'Handling']/..").click()
    driver.find_element(By.XPATH, "//aside[@class = 'o_cp_sidebar']//a[contains(text(), 'Eksport')]").click()
    driver.find_element(By.XPATH, "//select[@class = 'o_exported_lists_select']/option[text() = 'Klinteborg - custom']").click() # if option does not exist, it has to be created manually
    driver.find_element(By.XPATH, "//footer/button/span[text() = 'Eksporter Til Fil']").click()

def navigate_to_medlemer(driver):
    driver.find_element(By.XPATH, "//header/button[@class = 'close']").click()
    driver.find_element(By.LINK_TEXT, "Medlemmer").click()
    driver.find_element(By.XPATH, "//*[text() = 'FDF K 19 - Vanløse']").click()
    driver.find_element(By.XPATH, "//button/div/span[text() = 'Medlemmer']/../..").click()
    time.sleep(5)
