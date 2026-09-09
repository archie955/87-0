from typing import Annotated

from fastapi import Depends, Request
from pygam import LogisticGAM

def get_model(request: Request) -> LogisticGAM:
    model = getattr(request.app.state, "model", None)

    if model is None:
        raise RuntimeError("ML model hasn't been loaded")

    return model

ModelDep = Annotated[LogisticGAM, Depends(get_model)]