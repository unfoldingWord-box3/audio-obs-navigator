from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores.chroma import Chroma
from langchain_community.document_loaders import JSONLoader
from dotenv import load_dotenv

load_dotenv()

embeddings = OpenAIEmbeddings()

loader = JSONLoader(
    file_path='commands.json',
    jq_schema='.[].variants[]',
    text_content=False)

command_docs = loader.load()

db = Chroma.from_documents(
  command_docs,
  embedding=embeddings,
  persist_directory="emb"
)

# print(db)

results = db.similarity_search(
  "Go to story 7 frame 2"
)

for result in results:
  print("\n")
  print(result.page_content)
