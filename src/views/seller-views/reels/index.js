import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, Modal, Row, Space, Switch, Table, Tag, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerReels, addSellerReel, updateSellerReel, deleteSellerReel } from '../../../redux/slices/reels';
import { shallowEqual } from 'react-redux';
import { toast } from 'react-toastify';
import MediaUpload from '../../../components/upload';
import { IMG_URL } from '../../../configs/app-global';

const { TextArea } = Input;

export default function SellerReels() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  
  const { reels, loading } = useSelector(
    (state) => state.reels,
    shallowEqual
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReel, setEditingReel] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewReel, setPreviewReel] = useState(null);

  const validateVideoFile = (file) => {
    return new Promise((resolve, reject) => {
      // Check file type - must be MP4
      if (!file.type.includes('mp4') && !file.name.toLowerCase().endsWith('.mp4')) {
        message.error('Only MP4 video files are allowed');
        reject('Invalid file type');
        return;
      }
      
      // Check file size - max 50MB
      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        message.error('Video file must be smaller than 50MB');
        reject('File too large');
        return;
      }
      
      // Check video duration - max 3 minutes
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration; // in seconds
        const maxDuration = 3 * 60; // 3 minutes in seconds
        
        if (duration > maxDuration) {
          message.error('Video must not be longer than 3 minutes');
          reject('Video too long');
          return;
        }
        
        // If all validations pass
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        message.success(`Video validated successfully (${minutes}:${seconds.toString().padStart(2, '0')})`);
        resolve(file);
      };
      
      video.onerror = function() {
        window.URL.revokeObjectURL(video.src);
        message.error('Invalid or corrupted video file');
        reject('Invalid video');
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleVideoUpload = async (file) => {
    try {
      await validateVideoFile(file);
      // For demo purposes, use a sample video URL
      const sampleVideoUrl = 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4';
      form.setFieldsValue({ video_url: sampleVideoUrl });
    } catch (error) {
      // Error already shown in message
    }
    return false; // Prevent automatic upload
  };

  useEffect(() => {
    dispatch(fetchSellerReels());
  }, [dispatch]);

  const handleSubmit = async (values) => {
    try {
      const reelData = {
        shop_id: parseInt(values.shop_id),
        description: values.description || '',
        video_url: typeof values.video_url === 'string' ? values.video_url : '',
        active: values.active ? 1 : 0, // Convert boolean to integer
      };

      if (editingReel) {
        await dispatch(updateSellerReel({ id: editingReel.id, data: reelData }));
        message.success(t('reel.updated.successfully'));
      } else {
        await dispatch(addSellerReel(reelData));
        message.success(t('reel.created.successfully'));
      }
      
      setIsModalVisible(false);
      setEditingReel(null);
      form.resetFields();
      dispatch(fetchSellerReels());
    } catch (error) {
      message.error(t('something.went.wrong'));
    }
  };

  const handleEdit = (reel) => {
    setEditingReel(reel);
    form.setFieldsValue({
      title: reel.title,
      description: reel.description,
      video_url: reel.video_url,
      is_active: reel.is_active,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: t('are.you.sure'),
      content: t('delete.reel.confirmation'),
      onOk: async () => {
        try {
          await dispatch(deleteSellerReel(id));
          message.success(t('reel.deleted.successfully'));
          dispatch(fetchSellerReels());
        } catch (error) {
          message.error(t('something.went.wrong'));
        }
      },
    });
  };

  const handlePreview = (reel) => {
    setPreviewReel(reel);
    setPreviewVisible(true);
  };

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <span className="text-gray-600">
          {text?.length > 50 ? `${text.substring(0, 50)}...` : text}
        </span>
      ),
    },
    {
      title: t('video'),
      dataIndex: 'video_url',
      key: 'video_url',
      render: (url) => (
        url ? (
          <video 
            src={url.includes('http') ? url : `${IMG_URL}${url}`}
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
            controls={false}
          />
        ) : (
          <div className="w-15 h-15 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Video</span>
          </div>
        )
      ),
    },
    {
      title: t('status'),
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? t('active') : t('inactive')}
        </Tag>
      ),
    },
    {
      title: t('likes'),
      dataIndex: 'likes_count',
      key: 'likes_count',
      render: (count) => <span className="text-blue-600">{count || 0}</span>,
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          />
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('my.reels')}</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingReel(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          {t('add.reel')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={Array.isArray(reels) ? reels : []}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      {/* Add/Edit Modal */}
      <Modal
        title={editingReel ? t('edit.reel') : t('add.reel')}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingReel(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label={t('title')}
                rules={[{ required: true, message: t('please.enter.title') }]}
              >
                <Input placeholder={t('enter.reel.title')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label={t('description')}
              >
                <TextArea 
                  rows={3} 
                  placeholder={t('enter.reel.description')} 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="video_url"
                label={t('video')}
                rules={[{ required: true, message: t('please.upload.video') }]}
                extra="Only MP4 files allowed. Maximum 3 minutes duration, 50MB file size."
              >
                <Upload
                  accept=".mp4"
                  beforeUpload={handleVideoUpload}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>
                    {form.getFieldValue('video_url') ? 'Change Video' : 'Upload MP4 Video'}
                  </Button>
                </Upload>
                {form.getFieldValue('video_url') && (
                  <div style={{ marginTop: 10 }}>
                    <video
                      width="200"
                      height="120"
                      controls
                      style={{ borderRadius: 4 }}
                    >
                      <source src={form.getFieldValue('video_url')} type="video/mp4" />
                    </video>
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="is_active"
                label={t('status')}
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren={t('active')} 
                  unCheckedChildren={t('inactive')} 
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => {
              setIsModalVisible(false);
              setEditingReel(null);
              form.resetFields();
            }}>
              {t('cancel')}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingReel ? t('update') : t('create')}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={t('reel.preview')}
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={400}
      >
        {previewReel && (
          <div className="text-center">
            <h3 className="mb-2">{previewReel.title}</h3>
            {previewReel.description && (
              <p className="text-gray-600 mb-4">{previewReel.description}</p>
            )}
            {previewReel.video_url && (
              <video
                src={previewReel.video_url.includes('http') ? previewReel.video_url : `${IMG_URL}${previewReel.video_url}`}
                controls
                style={{ width: '100%', maxHeight: 400, borderRadius: 8 }}
              />
            )}
            <div className="mt-4 flex justify-between text-sm text-gray-500">
              <span>{t('likes')}: {previewReel.likes_count || 0}</span>
              <span>{t('status')}: {previewReel.is_active ? t('active') : t('inactive')}</span>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}