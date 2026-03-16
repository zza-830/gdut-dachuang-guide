import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Tools = () => {
  // Progress Tracker State
  const [columns, setColumns] = useState({
    todo: {
      id: 'todo',
      title: '待办',
      items: [
        { id: '1', content: '完成项目申报' },
        { id: '2', content: '准备中期报告' },
        { id: '3', content: '提交经费报销' }
      ]
    },
    inProgress: {
      id: 'inProgress',
      title: '进行中',
      items: [
        { id: '4', content: '团队组建' }
      ]
    },
    done: {
      id: 'done',
      title: '已完成',
      items: [
        { id: '5', content: '项目立项' }
      ]
    }
  });

  // Feedback State
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedColumns = localStorage.getItem('progressColumns');
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    }
  }, []);

  // Save to localStorage whenever columns change
  useEffect(() => {
    localStorage.setItem('progressColumns', JSON.stringify(columns));
  }, [columns]);

  // Drag and Drop Handler
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const item = sourceColumn.items[source.index];

    if (source.droppableId === destination.droppableId) {
      // Same column reorder
      const newItems = Array.from(sourceColumn.items);
      newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, item);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: newItems
        }
      });
    } else {
      // Move to different column
      const sourceItems = Array.from(sourceColumn.items);
      const destItems = Array.from(destColumn.items);

      sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, item);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      });
    }
  };

  // Feedback Handler
  const handleFeedbackChange = (field, value) => {
    setFeedback({
      ...feedback,
      [field]: value
    });
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    console.log('Feedback submitted:', feedback);
    alert('反馈已提交！感谢您的意见。');
    setFeedback({ name: '', email: '', message: '' });
  };

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4">工具</h2>

      <Row>
        {/* Progress Tracker */}
        <Col md={12} className="mb-4">
          <Card>
            <Card.Header>
              <h4>进度跟踪</h4>
            </Card.Header>
            <Card.Body>
              <DragDropContext onDragEnd={onDragEnd}>
                <Row className="g-2">
                  {Object.values(columns).map(column => (
                    <Col xs={12} md={4} key={column.id} className="mb-3">
                      <h5 className="mb-3">{column.title}</h5>
                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{
                              backgroundColor: snapshot.isDraggingOver ? '#e7f3ff' : '#f8f9fa',
                              padding: '1rem',
                              minHeight: '250px',
                              borderRadius: '8px',
                              border: '1px solid #dee2e6'
                            }}
                          >
                            {column.items.map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      backgroundColor: snapshot.isDragging ? '#007BFF' : 'white',
                                      color: snapshot.isDragging ? 'white' : 'black',
                                      padding: '0.75rem',
                                      marginBottom: '0.5rem',
                                      borderRadius: '4px',
                                      border: '1px solid #dee2e6',
                                      cursor: 'grab'
                                    }}
                                  >
                                    {item.content}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </Col>
                  ))}
                </Row>
              </DragDropContext>
            </Card.Body>
          </Card>
        </Col>

        {/* Feedback Form */}
        <Col md={12} className="mb-4">
          <Card>
            <Card.Header>
              <h4>反馈表单</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleFeedbackSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>姓名</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="输入您的姓名"
                    value={feedback.name}
                    onChange={(e) => handleFeedbackChange('name', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>邮箱</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="输入您的邮箱"
                    value={feedback.email}
                    onChange={(e) => handleFeedbackChange('email', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>反馈内容</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="输入您的反馈意见..."
                    value={feedback.message}
                    onChange={(e) => handleFeedbackChange('message', e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button variant="primary" type="submit">
                    提交反馈
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Tools;

