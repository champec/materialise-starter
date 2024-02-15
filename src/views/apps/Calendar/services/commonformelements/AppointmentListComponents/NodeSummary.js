import React from 'react';

const NodeSummary = ({ node, state }) => {
  const generateSummaryText = () => {
    let summaryElements = [];

    console.log('NodeSummary Node:', node);

    switch (node.type) {
      case 'component':
        if (node.componentType === 'criteriaChecklist') {
          const decisions = Object.keys(state.checkedCriteria || {})
            .map(criterion => state.checkedCriteria[criterion] ? criterion : null)
            .filter(criterion => criterion !== null)
            .join(', ');
          summaryElements.push(<p>Selected Criteria: {decisions || 'No Criteria Selected'}</p>);
        }
        break;

      case 'criteriaCheck':
        console.log('NodeSummary criteriaCheck state:', state);
        state?.criteria?.forEach((criterion, index) => {
          summaryElements.push(
            <p key={index}>{criterion.text} - Response: {criterion.response || 'No Response'}</p>
          );
        });
        break;

      case 'symptoms':
        state.symptoms && state.symptoms.forEach((symptom, index) => {
          summaryElements.push(
            <p key={index}>{symptom.text} - Response: {symptom.response || 'No Response'}</p>
          );
        });
        if (!state.symptoms || state.symptoms.length === 0) {
          summaryElements.push(<p>No Symptoms Assessed</p>);
        }
        break;

      case 'advice':
      case 'stop':
      case 'referral':
        summaryElements.push(<p>Decision: {state.decision || 'No decision made'}</p>);
        break;

      case 'question':
        summaryElements.push(
          <p>Question: {node.content}, Answer: {state.answer}</p>
        );
        break;

      case 'plan':
        summaryElements.push(
          <p>Plan for Patient: {state.planText || 'No plan specified'}</p>
        );
        break;

      case 'treatment':
        const treatmentSummary = state.selectedTreatments && state.selectedTreatments
          .map(id => node.treatments.find(t => t.id === id)?.name)
          .join(', ');
        summaryElements.push(
          <p>Selected Treatments: {treatmentSummary || 'No Treatments Selected'}</p>
        );
        break;

      case 'multiple_choice_question':
        summaryElements.push(
          <p>Selected Option: {state.selectedOption || 'No option selected'}</p>
        );
        break;

      case 'comments':
        summaryElements.push(
          <p>Comments: {state.comment || 'No Comments Provided'}</p>
        );
        break;

      case 'gateway':
        summaryElements.push(
          <p>Gateway Acknowledged: {state.acknowledged ? 'Yes' : 'No'}</p>
        );
        break;

      case 'information':
        summaryElements.push(
          <p>Information Reviewed: {state.reviewed ? 'Yes' : 'No'}</p>
        );
        break;

      case 'countBased': {
        const count = node.questions.reduce((acc, question) => acc + (question.response === node.countOption ? 1 : 0), 0);
        summaryElements.push(<p>{node.title}:</p>);
        node.questions.forEach((question, index) => {
          summaryElements.push(
            <p key={index}>{index + 1}. {question.text} - Response: {question.response}</p>
          );
        });
        summaryElements.push(<p>{node.countText}: {count}</p>);
        break;
      }

      default:
        console.log('Unsupported node type:', node.type);
        summaryElements.push(<p>Information not available for this node type</p>);
    }

    return summaryElements;
  };

  const summaryElements = generateSummaryText();

  return (
    <div>
      {summaryElements}
    </div>
  );
};

export default NodeSummary;
