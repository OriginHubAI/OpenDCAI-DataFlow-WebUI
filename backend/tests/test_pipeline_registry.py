"""
Pipeline注册表功能测试

使用 pytest 运行:
    pytest tests/test_pipeline_registry.py -v
"""
import pytest
from typing import Dict, Any
from app.services.pipeline_registry import PipelineRegistry
from app.schemas.pipelines import (
    PipelineIn,
    PipelineConfig,
    PipelineOperator,
    ExecutionStatus
)


# 测试数据 fixtures
@pytest.fixture
def pipeline_registry():
    """创建一个新的PipelineRegistry实例"""
    return PipelineRegistry()


@pytest.fixture
def sample_pipeline_operator():
    """创建一个示例PipelineOperator"""
    return {
        "name": "data_processor",
        "params": {"batch_size": 32, "shuffle": True},
        "location": (0, 0)
    }


@pytest.fixture
def sample_pipeline_config(sample_pipeline_operator):
    """创建一个示例PipelineConfig"""
    return {
        "file_path": "test_pipeline.py",
        "input_dataset": "test_dataset_123",
        "operators": [sample_pipeline_operator]
    }


@pytest.fixture
def sample_pipeline_data(sample_pipeline_config):
    """创建示例Pipeline输入数据"""
    return {
        "name": "测试Pipeline",
        "config": sample_pipeline_config,
        "tags": ["test", "nlp"]
    }


@pytest.fixture
def created_pipeline(pipeline_registry, sample_pipeline_data):
    """创建并返回一个已创建的Pipeline"""
    return pipeline_registry.create_pipeline(sample_pipeline_data)


class TestPipelineRegistry:
    """Pipeline注册表测试类"""

    def test_create_registry(self, pipeline_registry):
        """测试创建Pipeline注册表实例"""
        assert pipeline_registry is not None
        assert pipeline_registry.path is not None

    def test_create_pipeline(self, pipeline_registry, sample_pipeline_data):
        """测试创建Pipeline"""
        pipeline = pipeline_registry.create_pipeline(sample_pipeline_data)
        
        assert pipeline is not None
        assert "id" in pipeline
        assert "name" in pipeline
        assert "config" in pipeline
        assert "tags" in pipeline
        assert "created_at" in pipeline
        assert "updated_at" in pipeline
        assert "status" in pipeline
        
        assert pipeline["id"] is not None
        assert pipeline["name"] == sample_pipeline_data["name"]
        assert pipeline["config"]["input_dataset"] == sample_pipeline_data["config"]["input_dataset"]
        assert pipeline["tags"] == sample_pipeline_data["tags"]
        assert pipeline["status"] == "queued"

    def test_get_pipeline(self, pipeline_registry, created_pipeline):
        """测试获取Pipeline详情"""
        pipeline_id = created_pipeline["id"]
        retrieved_pipeline = pipeline_registry.get_pipeline(pipeline_id)
        
        assert retrieved_pipeline is not None
        assert retrieved_pipeline["id"] == pipeline_id
        assert retrieved_pipeline["name"] == created_pipeline["name"]
        assert retrieved_pipeline["config"]["input_dataset"] == created_pipeline["config"]["input_dataset"]

    def test_get_nonexistent_pipeline(self, pipeline_registry):
        """测试获取不存在的Pipeline"""
        pipeline = pipeline_registry.get_pipeline("nonexistent_id")
        assert pipeline is None

    def test_update_pipeline(self, pipeline_registry, created_pipeline, sample_pipeline_data):
        """测试更新Pipeline"""
        pipeline_id = created_pipeline["id"]
        
        # 修改数据
        updated_data = {
            "name": "更新后的Pipeline",
            "config": sample_pipeline_data["config"],
            "tags": ["updated", "test"]
        }
        
        updated_pipeline = pipeline_registry.update_pipeline(pipeline_id, updated_data)
        
        assert updated_pipeline["id"] == pipeline_id
        assert updated_pipeline["name"] == "更新后的Pipeline"
        assert updated_pipeline["tags"] == ["updated", "test"]
        assert updated_pipeline["created_at"] == created_pipeline["created_at"]  # 创建时间不变
        assert updated_pipeline["updated_at"] != created_pipeline["updated_at"]  # 更新时间改变

    def test_update_nonexistent_pipeline(self, pipeline_registry, sample_pipeline_data):
        """测试更新不存在的Pipeline"""
        with pytest.raises(ValueError):
            pipeline_registry.update_pipeline("nonexistent_id", sample_pipeline_data)

    def test_delete_pipeline(self, pipeline_registry, created_pipeline):
        """测试删除Pipeline"""
        pipeline_id = created_pipeline["id"]
        
        # 确认Pipeline存在
        assert pipeline_registry.get_pipeline(pipeline_id) is not None
        
        # 删除Pipeline
        result = pipeline_registry.delete_pipeline(pipeline_id)
        assert result is True
        
        # 确认Pipeline已删除
        assert pipeline_registry.get_pipeline(pipeline_id) is None

    def test_delete_nonexistent_pipeline(self, pipeline_registry):
        """测试删除不存在的Pipeline"""
        result = pipeline_registry.delete_pipeline("nonexistent_id")
        assert result is False

    def test_list_pipelines(self, pipeline_registry, sample_pipeline_data):
        """测试列出所有Pipelines"""
        # 创建多个Pipelines
        pipeline1 = pipeline_registry.create_pipeline(sample_pipeline_data)
        pipeline2 = pipeline_registry.create_pipeline(
            {
                "name": "Pipeline 2",
                "config": sample_pipeline_data["config"],
                "tags": ["tag2"]
            }
        )
        
        all_pipelines = pipeline_registry.list_pipelines()
        # Find the ones we just created
        ids = [p["id"] for p in all_pipelines]
        assert pipeline1["id"] in ids
        assert pipeline2["id"] in ids
