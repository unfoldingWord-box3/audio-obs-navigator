from dotenv import load_dotenv
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores.chroma import Chroma
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
import argparse
from redundant_filter_retriever import RedundantFilterRetriever
import langchain

langchain.debug = True

load_dotenv()

parser = argparse.ArgumentParser()
parser.add_argument("--input", default="Open OBS story 9 frame 4")
args = parser.parse_args()

chat = ChatOpenAI()
embeddings = OpenAIEmbeddings()
db = Chroma(
  persist_directory="emb",
  embedding_function=embeddings
)
retriever = RedundantFilterRetriever(
  embeddings=embeddings,
  chroma=db
)

system_template = """Open Bible stories consist of 50 stories and x number of frames per story.
When you rephrase the request, convert english numbers to actual numbers, without suffixes like "nd, rd, etc".
If no story_number or frame_number is specified, assume all stories
Given a user's request, use one of the items from the following context to rephrase it as a command. 
Do NOT add anything besides an item from the context. Return the item you select ONLY!
If you cannot find something similar, return "no command found"
----------------
{context}"""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
CHAT_PROMPT = ChatPromptTemplate.from_messages(messages)

chain = RetrievalQA.from_llm(
  llm=chat,
  prompt=CHAT_PROMPT,
  retriever=retriever
)

def getCommand(query: str) -> str:
  return chain.run(query)

print(getCommand(query=args.input))
