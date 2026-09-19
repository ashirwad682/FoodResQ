"""
FoodResQ Configuration Package
Configures global DRF field mapping and JSON encoder for MongoDB ObjectId.
"""
from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from django_mongodb_backend.fields import ObjectIdAutoField, ObjectIdField
from bson import ObjectId
from rest_framework.utils.encoders import JSONEncoder as DRFJSONEncoder

# Map ObjectId fields to CharField in ModelSerializers
ModelSerializer.serializer_field_mapping[ObjectIdAutoField] = serializers.CharField
ModelSerializer.serializer_field_mapping[ObjectIdField] = serializers.CharField

# Enable BSON ObjectId serialization in DRF JSONRenderer
_original_default = DRFJSONEncoder.default

def _custom_json_default(self, obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    return _original_default(self, obj)

DRFJSONEncoder.default = _custom_json_default
