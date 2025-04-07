import requests
import xml.etree.ElementTree as ET

def get_urls_from_sitemap(sitemap_url):
  try:
    response = requests.get(sitemap_url)
    response.raise_for_status()
    tree = ET.fromstring(response.content)
    urls = [elem.text for elem in tree.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    print(f"Found {len(urls)} URLs in the sitemap.")
    return urls
  except requests.exceptions.RequestException as e:
    print(f"Failed to fetch sitemap: {e}")
    return []

def check_urls(urls):
  unavailable_urls = []

  for url in urls:
    try:
      response = requests.get(url, timeout=5)
      if response.status_code != 200:
        print(f"[Unavailable] {url} returned status code {response.status_code}")
        unavailable_urls.append(url)
      else:
        print(f"[Available] {url}")
    except requests.exceptions.RequestException as e:
      print(f"[Error] {url} raised an exception: {e}")
      unavailable_urls.append(url)

  return unavailable_urls


if __name__ == "__main__":
  sitemap_url = "https://pulterproject.northwestern.edu/sitemap.xml"
  urls_to_check = get_urls_from_sitemap(sitemap_url)

  unavailable = check_urls(urls_to_check)

  print("\nSummary:")
  if unavailable:
    print("The following URLs are unavailable:")
    for url in unavailable:
      print(f"- {url}")
  else:
    print("All URLs are available.")
