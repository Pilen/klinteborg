
import csv
import math
import dataclasses

from pathlib import Path

def make_triplets(it):
    try:
        while True:
            a = next(it)
            b = next(it)
            c = next(it)
            yield (a, b, c)
    except StopIteration:
        pass


def load(path):
    # Each row is a "post" ("udvalg" / "job") each column (or actually 3 columns in a triplet) is the answer of the questionare from one person
    posts = []
    # The weighting of work before / at the camp
    weighting = []
    with path.open(newline="") as file:
        reader = csv.reader(file)
        next(reader) # ignore headers
        for row in reader:
            it = iter(row)
            post = next(it)
            if post == "Vægtning":
                # weighting = [int(float(v)) for v in it if v != ""]
                weighting = [int(float(v)) if v != "" else None for _, _, v in make_triplets(it)]
                print(weighting)
            elif post:
                triplets = []
                for before, during, experience in make_triplets(it):
                    before = int(before) if before != "" else None
                    if during == "0-6":
                        during = "6"
                    during = int(during) if during != "" else None
                    experience = experience.lower() == "x"
                    triplets.append((before, during, experience))
                posts.append((post, triplets))
    return posts, weighting

def transform(posts, weighting):
    result = [[] for i in range(len(posts[0][1]))]
    for (name, answers) in posts:
        for i, (før, under, erfaring) in enumerate(answers):
            result[i].append({"gruppe": name,
                              "før": før,
                              "under": under,
                              "erfaring": erfaring,
                              })
    return [{"grupper": r, "vægtning": v} for r, v in zip(result, weighting)]

# posts, weighting = load(Path("FDF/klinteborg/2023/livgrupper/livgrupper.csv"))
# result = transform(posts, weighting)
