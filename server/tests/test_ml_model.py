from unittest.mock import Mock

import pytest

from ml.ml_model import get_model


def test_get_model_missing():
    request = Mock()
    request.app.state.model = None

    with pytest.raises(RuntimeError):
        get_model(request)


def test_get_model_present():
    request = Mock()
    model = object()
    request.app.state.model = model

    assert get_model(request) is model
